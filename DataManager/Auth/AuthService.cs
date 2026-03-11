using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using DataManager.Shared;

namespace DataManager.Auth;

public class AuthService(HttpClient httpClient, IConfiguration configuration, ILogger<AuthService> logger) {
  public async Task<AuthUser> VerifyAuthUser(string code) {
    var verifyUrl = configuration.GetValue<string>("OAuth:VerifyUrl").Replace("{code}", code);

    var request = new HttpRequestMessage(HttpMethod.Get, verifyUrl);
    var responseMessage = await httpClient.SendAsync(request);

    if (!responseMessage.IsSuccessStatusCode) {
      var location = responseMessage.Headers.Location?.ToString();
      throw new Exception($"SSO serviceValidate returned {(int)responseMessage.StatusCode}. Redirect: {location}");
    }

    var responseText = await responseMessage.Content.ReadAsStringAsync();

    var response = ObjectUtils.Decode<AuthResponse>(responseText);

    if (response?.Result?.Success == null) {return null;}

    var successResult = response.Result.Success;

    // userService.AddOrUpdate(authUser);

    var authUser = new AuthUser(
      Username: successResult.Username,
      DisplayName: successResult.UserInfo.DisplayName,
      Token: GenerateToken(new Dictionary<string, string> {
        { "Username", successResult.Username },
        { "DisplayName", successResult.UserInfo.DisplayName }
      }) // return to client to cache in LocalStorage
    );

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
}

public record AuthResponse([property: JsonPropertyName("serviceResponse")] AuthResponse.AuthResult Result) {
  public record AuthResult(
    [property: JsonPropertyName("authenticationFailure")] AuthFailure? Failure,
    [property: JsonPropertyName("authenticationSuccess")] AuthSuccess? Success
  );

  public record AuthFailure(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("description")] string Description
  );

  public record AuthSuccess(
    [property: JsonPropertyName("user")] string Username,
    [property: JsonPropertyName("profile")] UserInfo UserInfo
  );

  public record UserInfo(
    [property: JsonPropertyName("displayName")] string DisplayName
  );
}

public record AuthUser(string Username, string DisplayName, string? Token);
