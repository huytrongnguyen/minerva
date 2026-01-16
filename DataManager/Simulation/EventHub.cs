using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;
using DataManager.Infrastructure;

namespace DataManager.Simulation;

public class EventHub(DataManagerDbContext db, IConfiguration config, ILogger<EventHub> logger) : Hub {
    // private readonly SimulatorDbContext _db;
    // private readonly IConfiguration _config;
    // private readonly ILogger<EventHub> _logger;
    // private static readonly HttpClient _httpClient = new();

    // public EventHub(SimulatorDbContext db, IConfiguration config, ILogger<EventHub> logger)
    // {
    //     _db = db;
    //     _config = config;
    //     _logger = logger;
    // }

    // /// <summary>
    // /// Called by the automated simulator for EVERY event (install, purchase, level_complete, etc.)
    // /// </summary>
    // public async Task SendEvent(string eventName, Dictionary<string, object> properties, string userId)
    // {
    //     var timestamp = DateTime.UtcNow;

    //     // 1. Save to Postgres (player_360 source)
    //     var evt = new EventLog
    //     {
    //         UserId = userId,
    //         EventName = eventName,
    //         Timestamp = timestamp,
    //         PropertiesJson = JsonSerializer.Serialize(properties)
    //     };
    //     _db.EventLogs.Add(evt);
    //     await _db.SaveChangesAsync();

    //     // 2. Push to ThinkingData (real-time)
    //     await PushToThinkingData(eventName, properties, userId, timestamp);

    //     // 3. Push to real AppsFlyer (optional — for true closed-loop testing)
    //     if (_config.GetValue<bool>("AppsFlyer:Enabled"))
    //     {
    //         await PushToAppsFlyer(eventName, properties, userId, timestamp);
    //     }

    //     // 4. Update & broadcast live stats to React dashboard
    //     await UpdateAndBroadcastStats();

    //     _logger.LogInformation("Event {Event} from {UserId} processed", eventName, userId);
    // }

    // private async Task PushToThinkingData(string eventName, Dictionary<string, object> properties, string userId, DateTime ts)
    // {
    //     try
    //     {
    //         var tdEvent = new
    //         {
    //             distinct_id = userId,
    //             time = ts,
    //             type = "track",
    //             event = eventName,
    //             properties
    //         };

    //         var payload = JsonSerializer.Serialize(new[] { tdEvent });
    //         var content = new StringContent(payload, Encoding.UTF8, "application/json");

    //         var tdUrl = _config["ThinkingData:ServerUrl"] ?? "https://api.thinkingdata.cn/track";
    //         content.Headers.Add("X-App-ID", _config["ThinkingData:AppId"]);

    //         var response = await _httpClient.PostAsync(tdUrl, content);
    //         if (!response.IsSuccessStatusCode)
    //             _logger.LogWarning("ThinkingData push failed: {Status}", response.StatusCode);
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "ThinkingData push exception");
    //     }
    // }

    // private async Task PushToAppsFlyer(string eventName, Dictionary<string, object> properties, string userId, DateTime ts)
    // {
    //     try
    //     {
    //         // Extract appsflyer_id from properties (set during install simulation)
    //         var appsflyerId = properties.ContainsKey("appsflyer_id")
    //             ? properties["appsflyer_id"].ToString()
    //             : userId;  // fallback

    //         var afPayload = new
    //         {
    //             appsflyer_id = appsflyerId,
    //             event_name = eventName,
    //             event_time = ts.ToString("yyyy-MM-dd HH:mm:ss.fff"),
    //             event_value = eventName.Contains("purchase", StringComparison.OrdinalIgnoreCase)
    //                 ? new { af_revenue = properties.GetValueOrDefault("af_revenue", 0), af_currency = "USD" }
    //                 : null,
    //             custom_params = properties
    //         };

    //         var json = JsonSerializer.Serialize(afPayload);
    //         var content = new StringContent(json, Encoding.UTF8, "application/json");

    //         content.Headers.Add("appsflyer-key", _config["AppsFlyer:DevKey"]);
    //         content.Headers.Add("appsflyer-app-id", _config["AppsFlyer:AppId"]);

    //         var response = await _httpClient.PostAsync("https://api2.appsflyer.com/events", content);
    //         if (!response.IsSuccessStatusCode)
    //             _logger.LogWarning("AppsFlyer push failed: {Status}", response.StatusCode);
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "AppsFlyer push exception");
    //     }
    // }

    // private async Task UpdateAndBroadcastStats()
    // {
    //     var now = DateTime.UtcNow;
    //     var today = now.Date;

    //     var stats = new
    //     {
    //         ActivePlayers = await _db.ActivePlayers.CountAsync(),
    //         RevenuePerMinute = await _db.EventLogs
    //             .Where(e => e.EventName == "af_purchase" && e.Timestamp >= now.AddMinutes(-1))
    //             .SumAsync(e => JsonSerializer.Deserialize<JsonElement>(e.PropertiesJson).GetProperty("af_revenue").GetDouble()),
    //         NewUsersToday = await _db.EventLogs
    //             .Where(e => e.EventName == "af_install" && e.Timestamp.Date == today)
    //             .CountAsync(),
    //         TotalSpendToday = await _db.SimulatedCampaigns.SumAsync(c => c.SpendTodayUsd),
    //         LastEventTime = now
    //     };

    //     await Clients.All.SendAsync("StatsUpdate", stats);
    // }
}