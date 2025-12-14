// using Microsoft.Extensions.Hosting;
// using Microsoft.Extensions.Logging;
// using PerfectRpgSimulator.Backend.Hubs;
// using System.Collections.Concurrent;
// using System.Text.Json;

using DataManager.Infrastructure;
using Microsoft.AspNetCore.SignalR;

namespace DataManager.Simulation;

public class SimulationService(IHubContext<EventHub> hub, IConfiguration config, ILogger<SimulationService> logger) : BackgroundService {
    // private readonly IHubContext<EventHub> _hubContext;
    // private readonly SimulatorDbContext _db;
    // private readonly IConfiguration _config;
    // private readonly ILogger<SimulatorService> _logger;
    // private readonly Random _rnd = new();
    // private readonly ConcurrentBag<SimulatedPlayer> _activePlayers = new();
    // private readonly List<PendingInstall> _pendingInstalls = new();
    // private int _nextInternalUserId = 1_000_000;
    // private long _nextAppsFlyerIdCounter = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    // public SimulatorService(IHubContext<EventHub> hubContext, SimulatorDbContext db,
    //     IConfiguration config, ILogger<SimulatorService> logger)
    // {
    //     _hubContext = hubContext;
    //     _db = db;
    //     _config = config;
    //     _logger = logger;
    // }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
    //     _logger.LogInformation("SimulatorService started — generating perfect RPG data forever");

    //     while (!stoppingToken.IsCancellationRequested)
    //     {
    //         try
    //         {
    //             // 1. Run ad campaigns (impressions → clicks → installs)
    //             RunAdCampaigns();

    //             // 2. Process pending installs → registrations
    //             ProcessPendingInstalls();

    //             // 3. Make active players do realistic things
    //             SimulatePlayerBehavior();

    //             // 4. Cleanup old players (optional retention simulation)
    //             CleanupInactivePlayers();
    //         }
    //         catch (Exception ex)
    //         {
    //             _logger.LogError(ex, "Error in simulation loop");
    //         }

            await Task.Delay(5_000, stoppingToken); // 5-second ticks = perfect realism
    //     }
    }

    // private void RunAdCampaigns()
    // {
    //     var activeCampaigns = _db.SimulatedCampaigns
    //         .Where(c => c.IsActive && c.SpendTodayUsd < c.DailyBudgetUsd)
    //         .ToList();

    //     foreach (var camp in activeCampaigns)
    //     {
    //         // Realistic hourly spend curve (peaks at evenings)
    //         var hourFactor = DateTime.UtcNow.Hour is >= 12 and <= 20 ? 1.8 : 0.6;
    //         var targetSpendThisTick = camp.DailyBudgetUsd / 24 / 12 * hourFactor; // 5-sec ticks
    //         var remainingBudget = camp.DailyBudgetUsd - camp.SpendTodayUsd;

    //         if (targetSpendThisTick > remainingBudget)
    //             targetSpendThisTick = remainingBudget;

    //         if (targetSpendThisTick < 10) continue; // too small

    //         // Funnel: Impressions → Clicks → Installs
    //         var impressions = (int)(targetSpendThisTick * _rnd.Next(90, 130)); // ~$0.008–$0.011 per imp
    //         var clicks = (int)(impressions * _rnd.Next(25, 65) / 1000.0);       // 2.5–6.5 % CTR
    //         var installs = (int)(clicks * _rnd.Next(90, 200) / 1000.0);                // 9–20 % CVR

    //         if (installs == 0) continue;

    //         var cpi = targetSpendThisTick / installs;

    //         for (int i = 0; i < installs; i++)
    //         {
    //             var appsflyerId = GenerateAppsFlyerId();
    //             var install = new PendingInstall
    //             {
    //                 AppsFlyerId = appsflyerId,
    //                 Campaign = camp,
    //                 Cpi = cpi,
    //                 InstallTime = DateTime.UtcNow.AddSeconds(-_rnd.Next(0, 300)), // spread over last 5 min
    //                 RegistrationDelaySeconds = _rnd.Next(30, 1800) // 30 sec – 30 min
    //             };

    //             _pendingInstalls.Add(install);

    //             // Fire real-looking AppsFlyer install event
    //             var props = new Dictionary<string, object>
    //             {
    //                 ["appsflyer_id"] = appsflyerId,
    //                 ["af_channel"] = camp.Platform,
    //                 ["af_campaign"] = camp.CampaignName,
    //                 ["af_campaign_id"] = camp.CampaignId,
    //                 ["af_adset"] = $"adset_{_rnd.Next(100,999)}",
    //                 ["af_ad"] = $"creative_{_rnd.Next(1,50)}",
    //                 ["af_cpi"] = Math.Round(cpi, 3),
    //                 ["country_code"] = RandomCountry(),
    //                 ["platform"] = camp.Platform.Contains("google") ? "android" : "ios",
    //                 ["is_organic"] = false
    //             };

    //             _ = _hubContext.Clients.All.SendAsync("SendEvent", "af_install", props, appsflyerId, stoppingToken);
    //         }

    //         // Update campaign spend
    //         camp.SpendTodayUsd += targetSpendThisTick;
    //         camp.InstallsToday += installs;
    //     }

    //     _db.SaveChangesAsync(stoppingToken).AsTask().Wait(stoppingToken);
    // }

    // private void ProcessPendingInstalls()
    // {
    //     var ready = _pendingInstalls
    //         .Where(x => (DateTime.UtcNow - x.InstallTime).TotalSeconds >= x.RegistrationDelaySeconds)
    //         .ToList();

    //     foreach (var install in ready)
    //     {
    //         var internalId = $"player_{_nextInternalUserId++}";
    //         var isWhale = _rnd.NextDouble() < 0.02;

    //         var player = new SimulatedPlayer
    //         {
    //             InternalUserId = internalId,
    //             AppsFlyerId = install.AppsFlyerId,
    //             Campaign = install.Campaign,
    //             IsWhale = isWhale,
    //             Level = 1,
    //             LastActive = DateTime.UtcNow,
    //             TotalRevenue = 0
    //         };

    //         _activePlayers.Add(player);

    //         // Fire registration + first session
    //         var regProps = new Dictionary<string, object>
    //         {
    //             ["appsflyer_id"] = install.AppsFlyerId,
    //             ["af_channel"] = install.Campaign.Platform,
    //             ["af_campaign"] = install.Campaign.CampaignName,
    //             ["registration_source"] = "paid",
    //             ["is_whale_potential"] = isWhale
    //         };

    //         _ = _hubContext.Clients.All.SendAsync("SendEvent", "registration_complete", regProps, internalId, CancellationToken.None);
    //         _ = _hubContext.Clients.All.SendAsync("SendEvent", "game_start", regProps, internalId, CancellationToken.None);
    //     }

    //     foreach (var r in ready) _pendingInstalls.Remove(r);
    // }

    // private void SimulatePlayerBehavior()
    // {
    //     foreach (var player in _activePlayers)
    //     {
    //         // Session timeout?
    //         if ((DateTime.UtcNow - player.LastActive).TotalMinutes > _rnd.Next(8, 45))
    //             continue;

    //         // 0–5 events per tick
    //         int events = _rnd.Next(0, 6);
    //         for (int i = 0; i < events; i++)
    //         {
    //             FireRandomEvent(player);
    //         }

    //         player.LastActive = DateTime.UtcNow;
    //     }
    // }

    // private void FireRandomEvent(SimulatedPlayer player)
    // {
    //     var roll = _rnd.NextDouble();
    //     string eventName;
    //     var props = new Dictionary<string, object>
    //     {
    //         ["appsflyer_id"] = player.AppsFlyerId,
    //         ["af_channel"] = player.Campaign.Platform,
    //         ["af_campaign"] = player.Campaign.CampaignName,
    //         ["level"] = player.Level
    //     };

    //     if (roll < 0.30) // 30 % resource spend
    //     {
    //         eventName = "resource_spent";
    //         props["resource_type"] = "gems";
    //         props["amount"] = _rnd.Next(50, 500);
    //     }
    //     else if (roll < 0.55) // 25 % mission
    //     {
    //         eventName = "mission_complete";
    //         props["mission_id"] = $"daily_{_rnd.Next(1,10)}";
    //     }
    //     else if (roll < 0.75) // 20 % level up
    //     {
    //         eventName = "level_complete";
    //         player.Level++;
    //         props["level_number"] = player.Level;
    //         props["time_spent_sec"] = _rnd.Next(180, 900);
    //     }
    //     else if (roll < 0.83) // 8 % gacha
    //     {
    //         eventName = "gacha_pull";
    //         props["gacha_type"] = "ten";
    //         props["cost"] = 2700;
    //     }
    //     else if (roll < 0.90) // 7 % ad watch
    //     {
    //         eventName = "ad_revenue";
    //         var adRev = Math.Round(_rnd.NextDouble() * 0.06 + 0.01, 4);
    //         props["af_revenue"] = adRev;
    //         props["placement"] = "rewarded_video";
    //     }
    //     else // 10 % purchase (whales much higher)
    //     {
    //         eventName = "af_purchase";
    //         var revenue = player.IsWhale
    //             ? _rnd.Next(20, 120)
    //             : _rnd.Next(1, 15);
    //         props["af_revenue"] = revenue;
    //         props["af_currency"] = "USD";
    //         props["af_content_id"] = $"gem_pack_{revenue}";
    //         player.TotalRevenue += revenue;
    //     }

    //     _ = _hubContext.Clients.All.SendAsync("SendEvent", eventName, props, player.InternalUserId, CancellationToken.None);
    // }

    // private void CleanupInactivePlayers()
    // {
    //     var cutoff = DateTime.UtcNow.AddHours(-24);
    //     var inactive = _activePlayers.Where(p => p.LastActive < cutoff).ToList();
    //     foreach (var p in inactive) _activePlayers.TryTake(out _);
    // }

    // private string GenerateAppsFlyerId()
    // {
    //     var ts = Interlocked.Increment(ref _nextAppsFlyerIdCounter);
    //     var rand = _rnd.Next(100000000, 999999999);
    //     return $"{ts}-{rand}";
    // }

    // private string RandomCountry() => new[] { "US", "GB", "DE", "JP", "KR", "BR", "IN", "FR" }[_rnd.Next(8)];
}