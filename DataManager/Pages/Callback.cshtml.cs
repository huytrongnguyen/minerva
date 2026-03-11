using DataManager.Auth;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DataManager.Pages;

public class CallbackModel(AuthService authService, ILogger<CallbackModel> logger) : PageModel {
  public string AuthToken { get; private set; } // We'll pass this to the view for JS storage
  public string ErrorMessage { get; private set; }

  public async Task<IActionResult> OnGet(string ticket) {
    if (string.IsNullOrWhiteSpace(ticket)) {
      ErrorMessage = "Authorization code is missing.";
      logger.Console($"ErrorMessage = {ErrorMessage}");
      return Page();
    }

    try {
      var authUser = await authService.VerifyAuthUser(ticket);
      AuthToken = authUser.Token;
      return Page(); // Render the page with tokens available for JS
    } catch (Exception e) {
      ErrorMessage = e.Message;
      return Page();
    }
  }
}