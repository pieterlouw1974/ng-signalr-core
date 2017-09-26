public IServiceProvider ConfigureServices(IServiceCollection services)
{
    services.AddSignalR();
}
 
 public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory,  IApplicationLifetime appLifetime)
 {
    app.UseSignalR(routes =>
    {
        routes.MapHub<SomeHub>("somehub");
    });
 }
