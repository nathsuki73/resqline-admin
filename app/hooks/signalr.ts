import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl("https://resqline-backend.onrender.com/hub/Notification", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return connection;
};
