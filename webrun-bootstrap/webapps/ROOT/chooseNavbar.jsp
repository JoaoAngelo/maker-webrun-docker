<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>

<%@ page import="wfr.sys.HTMLInterface.*" %>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <style>
      html, body {
        overflow-x: hidden;
        width: 100%;
        height: 100%;
        margin: 0;
      }

      body {
        padding: 2rem;
      }

      .navbar {
        cursor: pointer;
        -moz-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        transform: none;
        transition: all .2s ease;
      }

      .navbar > * {
        pointer-events: none;
      }

      .navbar:hover {
        transform: scale(1.1);
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.32);
        z-index: 1;
      }

      .navbar:active {
        transform: scale(1.0);
      }

      .selected {
        border: 3px solid #1e1e1e;
      }
    </style>
  </head>
  <body>
      <nav class="navbar navbar-expand-sm navbar-light" data-theme="none" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor01">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-light bg-light" data-theme="light" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor01">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-secondary" data-theme="secondary" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor02">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-dark" data-theme="dark" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor03" aria-controls="navbarColor03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor03">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-primary" data-theme="primary" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor04" aria-controls="navbarColor04" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor04">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-danger" data-theme="danger" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor05" aria-controls="navbarColor05" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor05">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-light bg-warning" data-theme="warning" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor06" aria-controls="navbarColor06" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor06">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-success" data-theme="success" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor07" aria-controls="navbarColor07" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor07">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <nav class="navbar navbar-expand-sm navbar-dark bg-info" data-theme="info" onclick="selectNavbar(this);">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor08" aria-controls="navbarColor08" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor08">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"><a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a></li>
          <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        </ul>
      </div>
    </nav>

    <script type="text/javascript">
      var navbarListFrame = parent.document.getElementById("WFRNavbarThemes");
      var selectedNavbar = null;

      function selectNavbar(nav) {
        if (selectedNavbar !== null) {
          selectedNavbar.classList.remove("selected");
        }

        var theme = nav.getAttribute("data-theme");
        nav.classList.add("selected");
        selectedNavbar = nav;

        navbarListFrame.selectedTheme = theme;
        navbarListFrame.setAttribute("data-theme", theme);
      }

      if (navbarListFrame && navbarListFrame.selectedTheme) {
        var elements = document.getElementsByTagName("nav");
        for (var i = 0, len = elements.length; i < len; i++) {
          if (elements[i].getAttribute("data-theme") == navbarListFrame.selectedTheme || ((navbarListFrame.selectedTheme == null || navbarListFrame.selectedTheme == "") && elements[i].getAttribute("data-theme") == "light")) {
            elements[i].className += " selected";
            selectedNavbar = elements[i];
            break;
          }
        }
      }
    </script>
  </body>
</html>
