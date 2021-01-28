<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLAdminInterface" %>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="java.util.*" %>
<%@ page import="wfr.exceptions.WFRException" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="net.tanesha.recaptcha.ReCaptcha" %>
<%@ page import="net.tanesha.recaptcha.ReCaptchaFactory" %>
<%
  wfr.sys.HTMLInterface.HTMLInterface htmlInterface = (wfr.sys.HTMLInterface.HTMLInterface) request.getAttribute("htmlInterface");
  List<WFREFile> systems = new ArrayList<WFREFile>(0);
  String exceptionMessage = null;

  try {
    systems = WFRLoader.systemsList();
  } catch (WFRException ex) {
    exceptionMessage = Functions.stringToJs(ex.getShowMessage(Resources.getInstance(request)));
  } catch (Exception ex) {
    exceptionMessage = ex.getMessage();
  }

  if (WFRConfig.config().getBoolean("WebrunManager", "UseWebrunManager")) {
    for (WFREFile file : systems) {
      String systemCode = file.getCode();
      if (systemCode.equals(WFRConfig.config().get("WebrunManager", "MainSystem"))) {
        String MK3FormGuid = WFRConfig.config().get("WebrunManager", "MainForm");//GUID Maker 3 Webrun Administrator System
        String redirectUrl = "";
        if (MK3FormGuid != null && !MK3FormGuid.equals("")) {
          redirectUrl = "form.jsp?sys=" + systemCode + "&action=openform&formID=" + MK3FormGuid;
        } else {
          redirectUrl = "open.do?sys=" + systemCode;
        }
%>
<script type="text/javascript">window.top.location.href = '<%=redirectUrl%>';</script>
<%
      }
    }
  }

  if (request.getParameter("sys") != null && request.getParameter("action") != null && request.getParameter("action").compareTo("logout") == 0) {
    request.getSession().removeAttribute("WFR" + request.getParameter("sys"));
  }

  Boolean isLogin = request.getParameter("login") != null ? Boolean.valueOf(request.getParameter("login")) : false;
  Functions.setWebrunSelectedSystemCookie(response, request.getParameter("syscode"));

  HTMLAdminInterface adminInterface = (HTMLAdminInterface)request.getSession().getAttribute("WFRAdmin");
  int attempts = (adminInterface != null) ? adminInterface.getTries() : 0;
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <title><webrun:message key="LABEL.SYSTEMS"/> - Webrun Studio <%=WFRSystem.WEBRUN_VERSION%></title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      function showLoading() {
        var loading = document.getElementById("loading");
        if (loading) loading.style.display = "block";
      }

      function switchCard(currentCard, targetCard, direction) {
        if (currentCard.classList.contains("d-none")) currentCard.classList.remove("d-none");
        if (!currentCard.classList.contains("d-inline-flex")) currentCard.classList.add("d-inline-flex");
        if (!currentCard.classList.contains("animated")) currentCard.classList.add("animated");
        if (!currentCard.classList.contains("slideOut" + (direction ? "Left" : "Right"))) currentCard.classList.add("slideOut" + (direction ? "Left" : "Right"));

        function handleAnimationEnd() {
          currentCard.removeEventListener("animationend", handleAnimationEnd);
          if (!currentCard.classList.contains("d-none")) currentCard.classList.add("d-none");
          if (currentCard.classList.contains("d-inline-flex"))currentCard.classList.remove("d-inline-flex");
          if (currentCard.classList.contains("animated")) currentCard.classList.remove("animated");
          if (currentCard.classList.contains("slideOut" + (direction ? "Left" : "Right"))) currentCard.classList.remove("slideOut" + (direction ? "Left" : "Right"));

          if (targetCard.classList.contains("d-none")) targetCard.classList.remove("d-none");
          if (!targetCard.classList.contains("d-inline-flex")) targetCard.classList.add("d-inline-flex");
          if (!targetCard.classList.contains("animated")) targetCard.classList.add("animated");
          if (!targetCard.classList.contains("slideIn" + (direction ? "Right" : "Left"))) targetCard.classList.add("slideIn" + (direction ? "Right" : "Left"));

          clearInvalidState();
        }

        currentCard.addEventListener("animationend", handleAnimationEnd);
      }

      function toggleAdminLogon(e) {
        e.preventDefault();
        var mainCard = document.getElementById("main-card");
        var adminCard = document.getElementById("admin-card");
        if (mainCard.classList.contains("d-inline-flex")) switchCard(mainCard, adminCard, true);
        else switchCard(adminCard, mainCard, false);
      }

      function changeLanguage(locale) {
        showLoading();
        var form = document.getElementById("WFRSystem");
        form.action = "admincore?action=indexChangeLanguage&locale=" + locale;
        form.submit();
      }

      function toLink(event, same, link) {
        event.preventDefault();
        var syscode = document.getElementById("syscode");
        var selectedSys = getSelectedSystem();
        if (!selectedSys || selectedSys.length == 0) {
          var syscodeFeedback = document.getElementById("syscode-feedback");
          syscode.classList.add("is-invalid");
          syscodeFeedback.innerHTML = '<webrun:message key="ERROR.SPECIFY_SYSTEM_CODE"/>';
        } else {
          showLoading();
          window.location = link;
        }

        return false;
      }

      function clearInvalidState() {
        var syscode = document.getElementById("syscode");
        var syscodeFeedback = document.getElementById("syscode-feedback");
        syscode.classList.remove("is-invalid");
        syscodeFeedback.innerHTML = "";
        document.querySelector('[autofocus]').focus(); //Focar componente de usuário após animação
      }

      function getSelectedSystem() {
        var e = document.getElementById("syscode");
        return e.selectedIndex >= 0 ? e.options[e.selectedIndex].value : null;
      }
    </script>
  </head>
  <body class="w-100 h-100 bg-light">
    <div id="loading" style="display: none;">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
      </div>
    </div>
    <div class="container py-5 px-md-0 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-sm-12 d-flex justify-content-center align-items-center">
          <div class="card bg-white position-relative w-100 shadow <% if (isLogin) { %>d-none<% } else { %>d-inline-flex<% } %>" id="main-card" style="max-width: 25rem;">
            <div class="card-body">
              <h5 class="card-title"><webrun:message key="LABEL.SYSTEMS"/></h5>
              <p class="card-text text-muted"><webrun:message key="INFO.SELECT_ONE_SYSTEM"/></p>

              <form name="WFRLogon" id="WFRSystem" class="needs-validation" method="post" action="open.do">
                <input type="hidden" name="locale" value="">
                <%
                  Collection<Language> languages = !Resources.I18N_FIXED ? Resources.getLanguages().values() : null;
                  Boolean ShowLanguages = (languages != null && languages.size() > 0);
                  Locale locale = Resources.getLocale(request);

                  if (ShowLanguages) {
                %>
                <div class="input-group">
                <% } %>
                  <select class="form-control custom-select h-100" name="syscode" id="syscode" tabindex="1">
                    <% String cookieSystem = Functions.getWebrunSelectedSystemCookie(request); %>
                    <% if (cookieSystem == null || cookieSystem.isEmpty()) { %><option value="" class="d-none" hidden disabled selected>&nbsp;</option><% } %>
                    <%
                      for (int i = 0; i < systems.size(); i++) {
                        WFREFile wfre = (WFREFile)systems.get(i);
                    %>
                    <option value="<%=wfre.getCode()%>"<% if (wfre.getCode().equals(cookieSystem)) { %> selected<% } %>><%=wfre.getName()%></option>
                    <% } %>
                  </select>
                  <% if (ShowLanguages) { %>
                  <div class="input-group-append btn-group">
                    <button type="button" class="btn btn-light dropdown-toggle px-2 py-0 flag-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 4rem;">
                      <img src="assets/icons/flags/<%= locale.toString() %>.svg" style="max-width: 1.68rem; max-height: 1.68rem;">
                    </button>
                    <div class="dropdown-menu dropdown-menu-right flag-menu">
                      <h6 class="dropdown-header"><webrun:message key="LABEL.LANGUAGE"/></h6>
                      <% for (Language language : languages) { %>
                      <% String languageStr = language.getLocale().toString(); %>
                      <button class="dropdown-item flag" type="button" onclick="changeLanguage('<%= languageStr %>');"><img src="assets/icons/flags/<%= languageStr %>.svg" class="mr-2" style="width: 2rem;"> <%=Functions.stringToHTMLString(language.getDescription())%></button>
                      <% } %>
                    </div>
                  </div>
                  <% } %>
                  <div class="invalid-feedback" id="syscode-feedback"></div>
                </div>
              </form>
            </div>
            <div class="card-footer bg-white border-top px-md-4 py-md-3">
              <button type="button" class="btn btn-primary mr-2" onclick="toLink(event, this, '<%= (request.getContextPath() + "/open.do?action=open&sys=") %>' + getSelectedSystem());"><webrun:message key="LABEL.SIGN_IN"/></button>
              <div class="btn-group">
                <button type="button" class="btn btn-secondary" onclick="toggleAdminLogon(event); return false;"><webrun:message key="LABEL.SETTINGS"/></button>
                <button type="button" class="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span class="sr-only"></span>
                </button>
                <div class="dropdown-menu">
                  <h6 class="dropdown-header"><webrun:message key="LABEL.ADVANCED"/></h6>
                  <a class="dropdown-item" href="<%=request.getContextPath()%>/autotest">Auto Test</a>
                </div>
              </div>
            </div>
          </div>
          <div class="card bg-white position-relative w-100 shadow <% if (isLogin) { %>d-inline-flex<% } else { %>d-none<% } %>" id="admin-card" style="max-width: 25rem;">
            <form name="WFRLogon" id="WFRLogon" class="needs-validation" method="post" action="admincore">
              <input name="action" type="hidden" id="action" value="logon">
              <div class="card-body">
                <h5 class="card-title"><webrun:message key="INFO.ACCESS_SETUP_SCREEN"/></h5>
                <p class="card-text text-muted"><webrun:message key="INFO.FILL_NAME_PASSWORD_ACCESS"/></p>
  
                <div class="form-group mb-3 row position-relative">
                  <label for="input-user" class="col-sm-3 col-form-label"><webrun:message key="LABEL.USER"/></label>
                  <div class="col-sm-9">
                    <input type="text" name="user" class="form-control" id="input-user" placeholder="<webrun:message key="LABEL.USER"/>" autofocus required>
                  </div>
                </div>
                <div class="form-group mb-0 row position-relative">
                  <label for="input-password" class="col-sm-3 col-form-label"><webrun:message key="LABEL.PASSWORD"/></label>
                  <div class="col-sm-9">
                    <input type="password" name="password" class="form-control" id="input-password" placeholder="<webrun:message key="LABEL.PASSWORD"/>" required>
                  </div>
                </div>
                <% if (Functions.isReCaptchaDefined(attempts)) { %>
                  <div class="form-group">
                    <%
                      String publicKey = WFRConfig.config().get("ReCaptcha", "PublicKey");
                      String privateKey = WFRConfig.config().get("ReCaptcha", "PrivateKey");
                      boolean secure = WFRConfig.config().getBoolean("ReCaptcha", "Secure");
                      ReCaptcha captcha = secure ?
                        ReCaptchaFactory.newSecureReCaptcha(publicKey, privateKey, false) :
                        ReCaptchaFactory.newReCaptcha(publicKey, privateKey, false);
                      out.print(captcha.createRecaptchaHtml(null, null));
                    %>
                  </div>
                <% } %>
              </div>
              <div class="card-footer bg-white border-top px-md-4 py-md-3">
                <button type="submit" class="btn btn-primary mr-2"><webrun:message key="LABEL.SIGN_IN"/></button>
                <button type="button" class="btn btn-secondary" onclick="toggleAdminLogon(event); return false;"><webrun:message key="LABEL.SYSTEMS"/></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright">Powered by Softwell Maker | Webrun <%=WFRSystem.WEBRUN_VERSION%></div>

    <% if (exceptionMessage != null) { %><script>alert("<%=exceptionMessage%>");</script><% } %>
    <% if (request.getParameter("msg") != null && request.getParameter("msg").length() > 0) { %>
    <script type="text/javascript">interactionError('<%=Functions.stringToJs(Functions.stringToHTMLString(Functions.fromISOtoBASE(request.getParameter("msg"))))%>');</script>
    <% } %>
    <webrun:errorMessage forceMethodCall="error.showWarningMessage"/>
  </body>
</html>
