<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.database.*" %>
<%@ page import="java.text.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@ page import="java.nio.file.*" %>
<%@ page import="wfr.exceptions.ExceptionMessage" %>
<%@ page import="org.jdom.*" %>
<%@ page import="org.jdom.input.*" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>
<webrun:controller requiresManagerUser="true">
<%
  Logger logger = Logger.getLogger(this.getClass());
  WFRConfig.setContext(getServletConfig().getServletContext(), request);

  String sys = request.getParameter("sys");
  HTMLInterface htmli = null;

  try {
    htmli = HTMLInterface.getInstance(request);
    htmli.checkJSPAccess(out, true);
  } catch (Exception e) {
    logger.error(htmli != null ? htmli.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }

  pageContext.setAttribute("htmli", htmli);

  Resources resources = Resources.getInstance(request);
  String i18nPath = resources.getI18NFilePath();

  // Criar o parser do XML.
  SAXBuilder builder = new SAXBuilder();

  // Obter a pasta de configurações do Webrun.
  Path configDir = Paths.get(WFRConfig.configDir());

  // Obter a pasta de configurações do Tomcat.
  Path tomcatConfigDir = configDir.getParent().resolve("tomcat").resolve("conf");


  // Abrir o arquivo de administradores.
  File adminXmlFile = new File(configDir.resolve("admin.xml").toString());
  Document adminXmlDoc = null;
  List<Element> adminXmlDocRootChildren = null;

  // Verificar se o arquivo existe.
  if (adminXmlFile.exists()) {
    // Abrir o admin.xml da pasta de configurações do Webrun.
    adminXmlDoc = builder.build(adminXmlFile);

    // Obter o grupo de administradores.
    adminXmlDocRootChildren = adminXmlDoc.getRootElement().getChildren();
  } else {
    adminXmlFile = null;
  }


  // Abrir o arquivo de configurações do Webrun.
  File configXmlFile = new File(configDir.resolve("config.xml").toString());
  Document configXmlDoc = null;
  List<Element> configXmlDocRootChildren = null;

  // Verificar se o arquivo existe.
  if (configXmlFile.exists()) {
    // Abrir o config.xml da pasta de configurações do Webrun.
    configXmlDoc = builder.build(configXmlFile);

    // Obter os grupos de configurações.
    configXmlDocRootChildren = configXmlDoc.getRootElement().getChildren();
  } else {
    configXmlFile = null;
  }


  // Abrir o arquivo de usuários do Tomcat.
  File tomcatUsersXmlFile = new File(tomcatConfigDir.resolve("tomcat-users.xml").toString());
  Document tomcatUsersXmlDoc = null;
  List<Element> tomcatUsersXmlDocRootChildren = null;

  // Verificar se o arquivo existe.
  if (tomcatUsersXmlFile.exists()) {
    // Abrir o tomcat-users.xml da pasta de configurações do Tomcat.
    tomcatUsersXmlDoc = builder.build(tomcatUsersXmlFile);

    // Obter os usuários do Tomcat.
    tomcatUsersXmlDocRootChildren = tomcatUsersXmlDoc.getRootElement().getChildren("user");
  } else {
    tomcatUsersXmlFile = null;
  }
%>
<%!
  /**
   * Obter o valor de um parâmetro do arquivo de administradores do Webrun.
   * @author Danilo Gadêlha
   * @param rootChildren Lista com os elementos filhos da raiz do admin.xml.
   * @param paramName Nome do parâmetro para obter o valor.
   */
  public static String getAdminParam(List<Element> rootChildren, String paramName) {
    if (rootChildren == null || paramName == null) return null;

    // Obter o grupo de administradores (primeiro grupo).
    Element adminGroupElement = rootChildren.get(0);

    // Obter os itens do grupo de administradores.
    List<Element> adminGroupChildren = adminGroupElement.getChildren("item");
    for (Element adminGroupChild : adminGroupChildren) {
      // Verificar se é o parâmetro especificado.
      if (adminGroupChild.getChild("item-name").getTextTrim().equalsIgnoreCase(paramName)) {
        return adminGroupChild.getChild("item-param").getTextTrim();
      }
    }

    return null;
  }

  /**
   * Obter o primeiro valor de um parâmetro de configuração do Webrun.
   * @author Danilo Gadêlha
   * @param rootChildren Lista com os elementos filhos da raiz do config.xml.
   * @param groupName Nome do grupo onde está o parâmetro.
   * @param paramName Nome do parâmetro para obter o valor.
   */
  public static String getConfigParam(List<Element> rootChildren, String groupName, String paramName) {
    if (rootChildren == null || groupName == null || paramName == null) return null;

    // Procurar pelo grupo especificado.
    for (Element configGroup : rootChildren) {
      // Verificar se é o grupo especificado.
      if (configGroup.getChild("group-name").getTextTrim().equalsIgnoreCase(groupName)) {
        // Obter os itens do grupo.
        List<Element> groupItems = configGroup.getChildren("item");

        // Procurar pelo parâmetro especificado.
        for (Element groupItem : groupItems) {
          // Verificar se é o parâmetro especificado.
          if (groupItem.getChild("item-name").getTextTrim().equalsIgnoreCase(paramName)) {
            // Obter o valor do parâmetro.
            return groupItem.getChild("item-param").getTextTrim();
          }
        }
      }
    }

    return null;
  }

  /**
   * Obter a senha de um usuário do Tomcat.
   * @author Danilo Gadêlha
   * @param rootChildren Lista com os elementos filhos da raiz do tomcat-users.xml.
   * @param userName Nome do usuário para obter a senha.
   */
  public static String getTomcatUserPassword(List<Element> rootChildren, String userName) {
    if (rootChildren == null || userName == null) return null;

    // Procurar pelo usuário especificado.
    for (Element userElement : rootChildren) {
      // Verificar se é o usuário especificado.
      if (userElement.getAttributeValue("username").equalsIgnoreCase(userName)) {
        // Obter a senha do usuário.
        return userElement.getAttributeValue("password");
      }
    }

    return null;
  }
%>
<%
  // Verificar o usuário e senha padrão do Webrun.
  String adminUsername = getAdminParam(adminXmlDocRootChildren, "login");
  String adminPassword = getAdminParam(adminXmlDocRootChildren, "senha");
  Boolean adminUserOk = !(adminUsername != null && adminUsername.equalsIgnoreCase("admin") && adminPassword != null && (adminPassword.equalsIgnoreCase("webrun") || adminPassword.equalsIgnoreCase("md5:5cb2f52aedb96411c4dc582c3a8fea73")));

  // Verificar o parâmetro de Versão de Segurança.
  String securityVersionParam = getConfigParam(configXmlDocRootChildren, "PropriedadesAvancadas", "VersaoSeguranca");
  Boolean securityVersionParamOk = (securityVersionParam != null && securityVersionParam.equals("1"));

  // Verificar o parâmetro de Modo de Depuração.
  String debugModeParam = getConfigParam(configXmlDocRootChildren, "Sessao", "DebugMode");
  Boolean debugModeOk = !(debugModeParam != null && debugModeParam.equals("1"));

  // Verificar o parâmetro de Compactação de Códigos JavaScript.
  String debugCachedFilesParam = getConfigParam(configXmlDocRootChildren, "Sessao", "DebugCachedFiles");
  Boolean debugCachedFilesParamOk = (debugCachedFilesParam != null && debugCachedFilesParam.equals("0"));

  // Verificar o usuário do Tomcat.
  String tomcatAdminPassword = getTomcatUserPassword(tomcatUsersXmlDocRootChildren, "admin");
  Boolean tomcatAdminUserOk = !(tomcatAdminPassword != null && tomcatAdminPassword.equals("z102030"));

  // Obter a conexão com o banco de dados do sistema.
  WFRData data = htmli.getData();
  DBConnection connection = data.connection();

  // Obter o código do usuário master.
  Integer masterCode = Functions.getUserCode(connection, "master");

  // Obter a versão criptografada da senha.
  String encryptedPassword = Functions.encryptUserPassword(masterCode.toString(), "1");

  // Procurar pelo usuário admininistrador padrão dos sistemas (Usuário: master, Senha: 1).
  Boolean defaultAdminUserOk = !Functions.checkIfCredentialsExists(connection, "master", encryptedPassword, "S");
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="INFO.SYSTEM_CHECK"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= Functions.legacyMessage() %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <style>
       #page-overlay {
         top: 0;
         bottom: 0;
         left: 0;
         right: 0;
         z-index: 100;
         background-color: rgba(255, 255, 255, 0.75);
      }

      .list-group-item.list-group-item-action {
        cursor: pointer;
      }

      .fas.fa-check {
        margin-left: 0.1rem;
        margin-right: 0.1rem;
      }
    </style>
    <script type="text/javascript">
      function showPageOverlay(type, content) {
        var pageOverlay = document.getElementById("page-overlay");
        var preloader = document.getElementById("preloader");
        var checkmark = document.getElementById("checkmark");
        var checkmarkLabel = document.getElementById("checkmark-label");
        pageOverlay.className = "d-flex align-items-center justify-content-center position-absolute w-100 h-100";

        if (type == 0) {
          preloader.className = "spinner-border text-primary";
          checkmark.className = "d-none";
          checkmarkLabel.className = "d-none";
          checkmarkLabel.innerHTML = "";
        } else if (type == 1) {
          pageOverlay.className += " flex-column";
          preloader.className = "d-none";
          checkmark.className = "success-checkmark d-block";
          checkmarkLabel.className = "w-100 mt-3 text-center text-success font-weight-bold";
          checkmarkLabel.innerHTML = content;
        }
      }

      function hidePageOverlay() {
        var pageOverlay = document.getElementById("page-overlay");
        pageOverlay.className = "d-none";
      }

      function showErrorMessage(message, details) {
        if (details) new HTMLMessage().showErrorMessage(message, "<webrun:message key="JS.LABEL.DETAILS" js="true"/>:", null, details, null, true);
        else new HTMLMessage().showErrorMessage(message, null, null, null, 'DB', true);
      }

      function fixConfigUser(section, username) {
        var message = new HTMLMessage();
        message.showPromptMessage("<webrun:message key="INFO.PASSWORD_CHANGE" js="true"/>", "<webrun:message key="LABEL.NEW_PASSWORD" js="true"/>:", "<webrun:message key="LABEL.PASSWORD" js="true"/>", function(password) {
          if (password && password.length > 0) {
            showPageOverlay(0);
            $.post("systemCheckFix.do?action=systemCheckFix&sys=<%=sys%>&section=" + section + "User", {
              username: username,
              password: password
            }, function(response) {
              if (response && response.success === "1") {
                showPageOverlay(1, "");
                setTimeout(function() {
                  window.location.reload();
                }, 1000);
              } else {
                hidePageOverlay();
                showErrorMessage("<webrun:message key="ERROR.UPDATE_USER_PASSWORD" js="true"/>", response && response.details ? response.details : null);
              }
            }).fail(function() {
              hidePageOverlay();
              showErrorMessage("<webrun:message key="ERROR.CONNECTION_FAILED" js="true"/>");
            });
          }
        });
      }

      function fixConfigParam(groupName, paramName, paramValue) {
        $.post("systemCheckFix.do?action=systemCheckFix&sys=<%=sys%>&section=configParam", {
          group: groupName,
          param: paramName,
          value: paramValue
        }, function(response) {
          if (response && response.success === "1") {
            showPageOverlay(1, "");
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          } else {
            hidePageOverlay();
            showErrorMessage("<webrun:message key="ERROR.UPDATE_USER_PASSWORD" js="true"/>", response && response.details ? response.details : null);
          }
        }).fail(function() {
          hidePageOverlay();
          showErrorMessage("<webrun:message key="ERROR.CONNECTION_FAILED" js="true"/>");
        });
      }
    </script>
  </head>
  <body class="w-100 h-100 d-flex flex-column">
    <div class="d-none" id="page-overlay">
      <div class="spinner-border text-primary" role="status" id="preloader">
        <span class="sr-only"><webrun:message key="LABEL.WAIT"/>...</span>
      </div>
      <div class="d-none" id="checkmark">
        <div class="check-icon">
          <span class="icon-line line-tip"></span>
          <span class="icon-line line-long"></span>
        </div>
      </div>
      <label class="d-none" id="checkmark-label"></label>
    </div>

    <nav class="navbar navbar-expand navbar-light bg-light border-bottom mb-0">
      <span class="navbar-brand mb-0 h2 d-flex align-items-center"><i class="fas fa-clipboard-check mr-2" style="font-size: 1.5rem;"></i><webrun:message key="INFO.SYSTEM_CHECK"/></span>
      <div class="navbar-collapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="#" onclick="window.location.reload();"><webrun:message key="LABEL.REFRESH"/></a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="list-group list-group-flush">
      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#config-user" aria-expanded="false" aria-controls="config-user">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (adminUserOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!adminUserOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_USER"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="config-user">
        <div class="p-3">
          <% if (adminXmlFile != null) { %>
            <% if (adminUserOk) { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_USER_OK"/></span>
            <% } else { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_USER_PROBLEM"/></span>
            <% } %>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_ADMIN_XML_NOT_FOUND"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/estrutura_maker_e_webrun/arquivo_admin_xml.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (adminXmlFile != null && !adminUserOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigUser('config', '');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#security-version" aria-expanded="false" aria-controls="security-version">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (securityVersionParamOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!securityVersionParamOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_SECURITY_VERSION"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="security-version">
        <div class="p-3">
          <% if (configXmlFile != null) { %>
            <% if (securityVersionParamOk) { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_SECURITY_VERSION_OK"/></span>
            <% } else { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_SECURITY_VERSION_PROBLEM"/></span>
            <% } %>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_XML_NOT_FOUND"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/dicas_e_truques/webrun/como_aumentar_a_seguranca_de_sua_aplicacao.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (configXmlFile != null && !securityVersionParamOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigParam('PropriedadesAvancadas', 'VersaoSeguranca', '1');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#debug-mode" aria-expanded="false" aria-controls="debug-mode">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (debugModeOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!debugModeOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_MODE"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="debug-mode">
        <div class="p-3">
          <% if (configXmlFile != null) { %>
            <% if (debugModeOk) { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_MODE_OK"/></span>
            <% } else { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_MODE_PROBLEM"/></span>
            <% } %>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_XML_NOT_FOUND"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/webrun_3/parametro_configuracao/parametros_configuracao_sessao.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (configXmlFile != null && !debugModeOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigParam('Sessao', 'DebugMode', '0');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#debug-cached-files" aria-expanded="false" aria-controls="debug-cached-files">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (debugCachedFilesParamOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!debugCachedFilesParamOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_CACHED_FILES"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="debug-cached-files">
        <div class="p-3">
          <% if (configXmlFile != null) { %>
            <% if (debugCachedFilesParamOk) { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_CACHED_FILES_OK"/></span>
            <% } else { %>
              <span><webrun:message key="INFO.SYSTEM_CHECK_DEBUG_CACHED_FILES_PROBLEM"/></span>
            <% } %>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_CONFIG_XML_NOT_FOUND"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/webrun_3/parametro_configuracao/parametros_configuracao_sessao.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (configXmlFile != null && !debugCachedFilesParamOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigParam('Sessao', 'DebugCachedFiles', '0');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#tomcat-admin-user" aria-expanded="false" aria-controls="tomcat-admin-user">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (tomcatAdminUserOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!tomcatAdminUserOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_TOMCAT_USER"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="tomcat-admin-user">
        <div class="p-3">
          <% if (tomcatUsersXmlFile != null) { %>
            <% if (tomcatAdminUserOk) { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_TOMCAT_USER_OK"/></span>
            <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_TOMCAT_USER_PROBLEM"/></span>
            <% } %>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_TOMCAT_USERS_XML_NOT_FOUND"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/maker_3/instalacoes/senhas_padrao.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (tomcatUsersXmlFile != null && !tomcatAdminUserOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigUser('tomcat', 'admin');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

      <div class="list-group-item list-group-item-action bg-light border-top-0 d-flex p-0" data-toggle="collapse" data-target="#system-admin-user" aria-expanded="false" aria-controls="system-admin-user">
        <div class="d-flex align-items-center px-3 py-2 border-right" style="font-size: 1.25rem;">
          <% if (defaultAdminUserOk) { %><i class="fas fa-check text-success my-1"></i><% } else { %><i class="fas fa-exclamation-triangle text-danger my-1"></i><% } %>
        </div>
        <div class="d-flex align-items-center px-3 py-2 flex-fill text-muted">
          <h6 class="mb-0<% if (!defaultAdminUserOk) { %> text-danger<% } %>"><webrun:message key="INFO.SYSTEM_CHECK_DEFAULT_USER"/></h6>
        </div>
      </div>
      <div class="collapse border-bottom" id="system-admin-user">
        <div class="p-3">
          <% if (defaultAdminUserOk) { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_DEFAULT_USER_OK"/></span>
          <% } else { %>
            <span><webrun:message key="INFO.SYSTEM_CHECK_DEFAULT_USER_PROBLEM"/></span>
          <% } %>
        </div>
        <div class="d-flex justify-content-end p-3 bg-light border-top">
          <a class="btn btn-secondary ml-2" role="button" href="https://suporte.softwell.com.br/maker/manual_3/pt/maker_3/instalacoes/senhas_padrao.htm" target="_blank"><webrun:message key="LABEL.MORE_INFO"/></a>
          <% if (!defaultAdminUserOk) { %><a class="btn btn-primary ml-2" role="button" href="#" onclick="fixConfigUser('system', 'master');"><webrun:message key="LABEL.APPLY_FIX"/></a><% } %>
        </div>
      </div>

    </div>
  </body>
</html>
</webrun:controller>
