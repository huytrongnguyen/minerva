using DataManager.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DataManager.Pages.Auth;

public class LoginModel(AuthService authService) : PageModel {
  public IActionResult OnGet() {
    // var loginUrl = authService.GetLoginUrl();
    // var authCode = authService.MockAuthCode(loginUrl); // mock authorization code
    var authCode = 1;
    return RedirectToPage("callback", new { code = authCode });
  }
}