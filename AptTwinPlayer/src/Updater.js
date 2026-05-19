// Updater.js

// WebSocket
export class HAWebSocket {
    ID = 18; // some arbitrary number for id

    constructor(playerself) {
        const base_url = playerself.scene.userData.url;
        const url = "ws" + base_url.substring(4) + "/api/websocket";
        this.ha_socket = new WebSocket(url);
        this.ac_token =  playerself.scene.userData.token;

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
            "access_token": this.ac_token 
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
            const api_url = playerself.scene.userData.url + "/api/states";
            const access_token = player.scene.userData.token;
            const response = await fetch(api_url, {
                headers: {
                    "Authorization": `Bearer ${access_token}`,
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