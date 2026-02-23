using DataManager.Auth;
using DataManager.Campaign;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/campaigns")] [ApiController] [AuthFilter] public class CampaignController(CampaignService campaignService) : ControllerBase {
  [HttpGet] public List<CampaignInfo> List() => campaignService.List();
  [HttpPost("generate")] public Task<List<CampaignInfo>> Generate() => campaignService.Generate();
}