using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using DataManager.Shared;

namespace DataManager.Auth;

public class AuthService(IConfiguration configuration, ILogger<AuthService> logger) {
  public string GetLoginUrl() {
    var queryParams = string.Join("&",
      new Dictionary<string, string> {
        { "client_id", ClientId },
        { "redirect_uri", RedirectUri },
        { "response_type", "code" },
        { "scope", string.Join("%20", [
          "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile",
          "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email"
        ]) },
      }.Select(kvp => $"{kvp.Key}={kvp.Value}")
    );

    return "https://accounts.google.com/o/oauth2/v2/auth?" + queryParams;
  }

  public string MockAuthCode(string loginUrl) => GenerateToken(new Dictionary<string, string> { { "loginUrl", loginUrl } });

  public AuthUser VerifyAuthUser(string code) {
    var verifyResponse = Verify(code);
    var userInfo = GetUserInfo(verifyResponse.IdToken, verifyResponse.AccessToken);

    var authUser = new AuthUser {
      Username = userInfo.Username,
      Token = GenerateToken(new Dictionary<string, string> {
        { "Username", userInfo.Username }
      }) // return to client to cache in LocalStorage
    };

    return authUser;
  }

  public AuthUser GetAuthUser(string token) {
    if (token.IsEmpty()) return null;

    try {
      tokenHandler.ValidateToken(token, new TokenValidationParameters {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = signingKey,
          ValidateIssuer = false,
          ValidateAudience = false,
          // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
          ClockSkew = TimeSpan.Zero
      }, out SecurityToken validatedToken);

      var jwtToken = (JwtSecurityToken)validatedToken;
      var user = jwtToken.Claims.ToDictionary(x => x.Type, x => x.Value).Transform<AuthUser>();
      return user;
    } catch (Exception e) {
      logger.Console(e.Message);
      return null;
    }
  }

  private AuthVerifyResponse Verify(string code) {
    // var verifyUrl = "https://oauth2.googleapis.com/token";
    var body = new Dictionary<string, string> {
      { "code", code },
      { "client_id", ClientId },
      { "client_secret", ClientSecret },
      { "redirect_uri", RedirectUri },
      { "grant_type", "authorization_code" },
    };

    var idToken = GenerateToken(new Dictionary<string, string> { { "client_id", ClientId }, { "code", code } });
    var accessToken = GenerateToken(new Dictionary<string, string> { { "code", code } });

    return new AuthVerifyResponse(idToken, accessToken);// mock access token
  }

  private AuthUserInfoResponse GetUserInfo(string idToken, string accessToken) {
    // var userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + accessToken;
    // var userInfoHeader = new Dictionary<string, string> { { "Authorization", $"Bearer {idToken}" } };
    return new AuthUserInfoResponse("1", "test", "test@venus.com"); // mock user info
  }

  private string GenerateToken(Dictionary<string, string> authInfo) {
    var token = new JwtSecurityToken(
      claims: authInfo.Select(pair => new Claim(pair.Key, pair.Value)),
      expires: DateTime.UtcNow.AddDays(30),
      signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
    );
    return tokenHandler.WriteToken(token);
  }

  private readonly SecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
  private readonly SecurityKey signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
  private readonly string ClientId = configuration["OAuth:ClientId"];
  private readonly string ClientSecret = configuration["OAuth:ClientSecret"];
  private readonly string RedirectUri = configuration["OAuth:RedirectUri"];
}

public class AuthResponse {
  public bool Result { get; set; }
  public AuthUser User { get; set; }
}

public class AuthUser {
  public string Username { get; set; }
  public string Token { get; set; }
}

public record AuthVerifyResponse(
  [property: JsonPropertyName("id_token")] string IdToken,
  [property: JsonPropertyName("access_token")] string AccessToken
);

public record AuthUserInfoResponse(
  [property: JsonPropertyName("sub")] string Id,
  [property: JsonPropertyName("name")] string Username,
  [property: JsonPropertyName("email")] string Email
);