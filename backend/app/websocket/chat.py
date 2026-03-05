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
            try:
                data = await websocket.receive_json()
            except Exception as e:
                # Connection closed or broken; exit loop so we stop calling receive()
                logger.info("WS user_id=%s connection closed: %s", user_id, e)
                break
            try:
                receiver_id = int(data.get("receiver_id"))
            except (TypeError, ValueError) as e:
                logger.warning("WS invalid receiver_id from user_id=%s: %s", user_id, e)
                print(f"[WS] invalid receiver_id from user_id={user_id}: {data!r}")  # visible in terminal
                continue
            content = str(data.get("message", "")).strip()
            media_url = data.get("media_url")
            if isinstance(media_url, str):
                media_url = media_url.strip() or None
            else:
                media_url = None
            if not content and not media_url:
                continue

            logger.info("WS message received: sender_id=%s receiver_id=%s content=%r media_url=%s", user_id, receiver_id, content[:50] if content else "", media_url)
            content_preview = (content[:50] if content else "(media)")
            print(f"[WS] message received: sender={user_id} receiver={receiver_id} content={content_preview!r} media_url={media_url!r}")

            # Store message in database (individual message table)
            db = SessionLocal()
            try:
                msg = Message(
                    sender_id=user_id,
                    receiver_id=receiver_id,
                    content=content or "",
                    media_url=media_url,
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

            # Send to receiver in real time (JSON with content and optional media_url)
            await manager.send_personal_message(
                {"sender_id": user_id, "content": content or "", "media_url": media_url},
                receiver_id,
            )

    except WebSocketDisconnect:
        logger.info("WS /ws/chat: user_id=%s disconnected", user_id)
    finally:
        manager.disconnect(user_id)