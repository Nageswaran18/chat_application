import json
from typing import Dict, Union

from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: Union[str, dict], user_id: int):
        """Send text or JSON to one user. If message is dict, sends as JSON string."""
        if user_id not in self.active_connections:
            return
        if isinstance(message, dict):
            await self.active_connections[user_id].send_text(json.dumps(message))
        else:
            await self.active_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()





