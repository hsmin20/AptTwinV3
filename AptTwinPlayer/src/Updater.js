// Updater.js

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjNDZhYWI1Y2VhZWE0ZWI2OGU1OGVkY2EyZmI0NTA3MiIsImlhdCI6MTc3MTgyNzM2MCwiZXhwIjoyMDg3MTg3MzYwfQ.s7wkgzN3Lrh8jQblsNxF5cpF78t7o-TtHyGXy9uJf_Q";

// WebSocket
export class HAWebSocket {
    ID = 18; // some arbitrary number for id

    constructor(playerself) {
        const url = "ws://112.223.164.246:8123/api/websocket";
        this.ha_socket = new WebSocket(url);
        // this.ac_token = this.token; // player.scene.userData.token;

        var scope = this;
        this.ha_socket.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            const type = data.type;

            switch(type) {
                case "auth_required":
                    scope.authenticate();
                    break;
                case "auth_ok":
                    console.log("Got message from Server : auth_ok");
                    scope.subscribeToEvents();
                    break;
                case "auth_invalid":
                    alert("Auth_Invalid in WebSocket");
                    break;
                case "result":
                    if(data.success == true)
                        console.log("Got message from Server : Success");
                    break;
                case "event":
                    const evdata = data.event.data;
                    playerself.updateEntity(evdata);
                    break;
                default:
                    break;
            }
        });
    }

    send(message) {
        this.ha_socket.send(JSON.stringify(message));
    }

    authenticate() {
        this.send({
            "type": "auth",
            "access_token": token 
        });
    }

    subscribeToEvents() {
        this.send({
            "id": this.ID,
            "type": "subscribe_events",
            "event_type": "state_changed"
        });
    }

    unsubscribeToEvents() {
        this.send({
            "id": this.ID + 1,
            "type": "unsubscribe_events",
            "subscription": this.ID
        });
    }
}

// REST API : Polling based update
export class HARestAPI {
    intervalId = -1;

    constructor(player) {
        this.player = player;
    }
    
    async fetchDataFromHAAndUpdateScene() {
        try {
            const api_url = "http//112.223.164.246:8123/api/states";
            // const access_token = player.scene.userData.token;
            const response = await fetch(api_url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const data = await response.json();
    
            this.player.updateScene(data);
    
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle the error appropriately, e.g., display an error message or retry the request
        }
    }
    
    startDataUpdates(intervalMs) {
        this.intervalId = setInterval(fetchDataFromHAAndUpdateScene, intervalMs);
    }
    
    stopDataUpdates() {
        clearInterval(this.intervalId);
    }
}