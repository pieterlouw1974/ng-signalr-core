using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace XTime.Web.Hubs
{
    public class SomeHub : Hub
    {
		 private readonly static ConnectionMapping<string> _connections =
         new ConnectionMapping<string>();
		 
        #region Connection

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Clients.Client(Context.ConnectionId).InvokeAsync("Notify", AquireMessage);
            return base.OnDisconnectedAsync(exception);
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        #endregion Connection


        public Task RegisterAquireUser(string AquireUser)
        {
            string WebUserConnectionID = _connections.AddAquireUser(AquireUser, Context.ConnectionId);

            if (!String.IsNullOrEmpty(WebUserConnectionID))
            {
                var AquireMessage = new AquireMessageModel
                {
                    ContentMessage = "Connected",
                    TypeMessage = MessageType.connected
                };
                Clients.Client(WebUserConnectionID).InvokeAsync("Notify", AquireMessage);
            }

            return Clients.Client(Context.ConnectionId).InvokeAsync("RegisterAquireUser", Context.ConnectionId);
        }

        public Task RegisterWebUser(string WebUserName)
        {
            string AquireConnectionId = _connections.AddWebUser(WebUserName, Context.ConnectionId, "ea9f6765374f03bc3442");

            if (!String.IsNullOrEmpty(AquireConnectionId))
            {
                var AquireMessage = new AquireMessageModel
                {
                    ContentMessage = "Connected",
                    TypeMessage = MessageType.connected
                };
                Clients.Client(AquireConnectionId).InvokeAsync("Notify", AquireMessage);
            }

            return Clients.Client(Context.ConnectionId).InvokeAsync("RegisterWebUser", Context.ConnectionId);
        }

        #endregion Register

        #region NotifyWeb

        public Task NotifyWeb(object[] arr)
        {
            string UserStr = arr[0].ToString();

            SomeModel sm = (SomeModel)arr[1];

            var WebConnectionID = _connections.GetWebUserConnectionFromUser(UserStr);

            if (WebConnectionID != null)
            {
                return Clients.Client(WebConnectionID).InvokeAsync("Notify", sm);
            }
            else
            {
                return Clients.Client(Context.ConnectionId).InvokeAsync("Notify", sm);
            }
        }

        #endregion NotifyWeb

}
