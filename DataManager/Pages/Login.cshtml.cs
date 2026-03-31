using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DataManager.Pages;

public class LoginModel(IConfiguration configuration) : PageModel {
  public IActionResult OnGet() {
    var loginUrl = configuration.GetValue<string>("OAuth:LoginUrl");
    return Redirect($"{loginUrl}?code=1");
  }
}
