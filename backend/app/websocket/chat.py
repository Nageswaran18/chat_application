import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.db.database import SessionLocal
from app.models.message import Message
from app.websocket.manager import manager
from app.core.security import decode_access_token

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    payload = decode_access_token(token)

    if not payload:
        logger.warning("WS /ws/chat: invalid or missing token, closing")
        await websocket.close(code=1008)
        return

    user_id = int(payload.get("sub"))
    logger.info("WS /ws/chat: user_id=%s connected", user_id)
    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = int(data["receiver_id"])
            content = str(data["message"]).strip()

            if not content:
                continue

            logger.info("WS message received: sender_id=%s receiver_id=%s content=%r", user_id, receiver_id, content[:50])
            print(f"[WS] message received: sender={user_id} receiver={receiver_id} content={content[:50]!r}")  # visible in terminal

            # Store message in database (individual message table)
            db = SessionLocal()
            try:
                msg = Message(
                    sender_id=user_id,
                    receiver_id=receiver_id,
                    content=content,
                )
                db.add(msg)
                db.commit()
                logger.info("WS message saved to DB id=%s", msg.id)
                print(f"[WS] message SAVED to DB id={msg.id}")  # visible in terminal
            except Exception as e:
                logger.exception("WS message DB save failed: %s", e)
                print(f"[WS] DB SAVE FAILED: {e}")  # visible in terminal
                db.rollback()
            finally:
                db.close()

            # Send to receiver if connected (JSON so UI can show sender and content)
            await manager.send_personal_message(
                {"sender_id": user_id, "content": content},
                receiver_id,
            )

    except WebSocketDisconnect:
        logger.info("WS /ws/chat: user_id=%s disconnected", user_id)
        manager.disconnect(user_id)