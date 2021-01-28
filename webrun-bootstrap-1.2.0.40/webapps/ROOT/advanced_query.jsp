<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">
<%@ page import="wfr.com.*"%>
<%@ page import="wfr.util.*"%>
<%@ page import="wfr.sys.*"%>
<%@ page import="wfr.sys.HTMLInterface.*"%>
<%@ page import="java.util.*"%>
<%@ page import="wfr.util.Logger"%>
<%
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys");
  HTMLInterface wi = (HTMLInterface) request.getSession().getAttribute("WFR" + sys);
  WFRForm form = wi.getSystem().getForm(Functions.fromISOtoBASE(request.getParameter("formID")), wi.getData().connection());
  Resources resources = Resources.getInstance(request);

  ArrayList<String> grid = wi.getUserInfo().getAdvancedFields(Functions.fromISOtoBASE(request.getParameter("formID")));
  ArrayList<WFRMetaData> gridMD = new ArrayList<WFRMetaData>();
  HashMap<String, String> types = new HashMap<String, String>();

  String field = "";
  String names = "";

  List<WFRMetaData> formFields = form.getAllFields();
  List<String> saved = wi.getUserInfo().getSavedQueries(Functions.fromISOtoBASE(request.getParameter("formID")));
  Collections.sort(saved);
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.ADVANCED_QUERY"/></title>

    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.BOOTSTRAP_DATETIMEPICKER_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= HTMLConstants.MOMENT_JS %>
    <%= HTMLConstants.BOOTSTRAP_DATETIMEPICKER_JS %>

    <webrun:import src="<%=resources.getI18NFilePath()%>"/>
    <webrun:import src="wfr.js"/>
    <webrun:import src="wfr_masks.js"/>

    <script type="text/javascript">
      var mainform = parent && parent.mainform ? parent.mainform : parent;

      function clearFields() {
        var advQueryInput = document.getElementById("advanced-query-state");
        advQueryInput.value = "false";

        <%
          int j = 0;
          for (int i = 0; i < grid.size(); i++) {
            StringTokenizer st = new StringTokenizer((String) grid.get(i), ";");
            String f = st.nextToken().trim();
            String t = (st.hasMoreTokens()) ? st.nextToken().trim() : "1";
            WFRMetaData md = form.getFieldMetaData(f);

            if (md != null) {
              gridMD.add(md);
              types.put(f, t);
              out.println("document.WFRQueryForm.q$" + j + ".value = '';");
              j++;
            }
          }
        %>
      }

      function doSubmit(showMessage) {
        if (atLeastOneSelected(showMessage)) {
          var advQueryInput = document.getElementById("advanced-query-state");
          advQueryInput.value = "false";
          <%
            if (gridMD != null && gridMD.size() > 0) {
              for (int i = 0; i < gridMD.size(); i++) {
          %>
          if (document.WFRQueryForm.q$<%=i%>.value != '') advQueryInput.value = "true";
          <%
              }
            }
          %>
          document.WFRQueryForm.submit();
        }
      }

      function removeAdvancedField(sys, formID, num) {
        if (confirm('<webrun:message key="INFO.CONFIRM_REMOVE_FIELD" js="true"/>')) {
          sendUpdateRequest('removeAdvancedField.do?sys=' + sys + '&action=removeAdvancedField&formID=' + formID + '&num=' + num, true, false);
        }
      }

      function clean(sys, formID) {
        sendUpdateRequest('clearAdvancedField.do?sys=' + sys + '&action=clearAdvancedField&formID=' + formID, false, false);
        clearFields();
        document.WFRQueryForm.submit();
      }

      function save(sys, formID) {
        var name = prompt('<webrun:message key="INFO.NAME_QUERY_SAVE" js="true"/>', "");
        if (name != null && name != '') {
          var types = '';
          <%
            for (int i = 0; i < gridMD.size(); i++) {
              out.println("types += '&type$" + i + "=' + MM_findObj('type$" + i + "').value;");
            }
          %>
          sendUpdateRequest('saveAdvancedField.do?sys=' + sys + '&action=saveAdvancedField&formID=' + formID + types + '&name=' + name, true, false);
        }

        return false;
      }

      function load(qs) {
        <% if (wi.getUserInfo().getSavedQueries(Functions.fromISOtoBASE(request.getParameter("formID"))).size() > 0) { %>
        openWFRAdvancedQuerySaved(qs);
        <% } else { %>
        interactionInfo('<webrun:message key="INFO.NO_QUERY_SAVED" js="true"/>');
        <% } %>
      }

      function atLeastOneSelected(showMessage) {
        
        var inputs = $('input[data-date="true"]');
        
        for (var i = 0; i < inputs.length; i++) {
          if(!isDateTime(inputs[i].value, mainform.DATE_PATTERN)){
            
            interactionError(getLocaleMessage("ERROR.INVALID_FIELD_DATE_FORMAT", inputs[i].getAttribute("description-field")), (function(e) {
              inputs[i].focus();
            }), null);
            
            event.preventDefault();
            return false;
          }
        }
        
        var r = !<%=form.getProperty(ComponentProperty.ENTRAR_COMO_PESQUISA).equalsIgnoreCase("true")%>;
        <%
        if (gridMD != null && form.getProperty(ComponentProperty.ENTRAR_COMO_PESQUISA).equalsIgnoreCase("true")) {
          for (int i = 0; i < gridMD.size(); i++) {
            WFRMetaData c = (WFRMetaData)gridMD.get(i);
        %>
        if (document.WFRQueryForm.q$<%=i%>.value == '') {
          r = false;
        } else {
          parent.searched = true;
          return true;
        }
        <% } %>
        if (!r) {
          if (showMessage) alertText('<webrun:message key="ERROR.FILL_AT_LEAST_ONE_SELECT_FIELD" js="true"/>');
          return false;
        }
        <% } %>
        parent.searched = true;
        return r;
      }

      function addAdvancedField(sys, formID, field, type) {
        sendUpdateRequest('addAdvancedField.do?sys=' + sys + '&action=addAdvancedField&formID=' + formID + '&field=' + field + '&type=' + type, true, false);
      }

      function restoreSaved(sys, formID, name) {
        sendUpdateRequest('restoreAdvancedField.do?sys=' + sys + '&action=restoreAdvancedField&formID=' + formID + '&name=' + name, true, false);
      }

      function removeSaved(sys, formID, msg, name) {
        if (confirm(msg)) sendUpdateRequest('removeSavedQuery.do?sys=' + sys + '&action=removeSavedQuery&formID=' + formID + '&name=' + name, true, false);
      }

      function sendUpdateRequest(url, reload, updateData) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function(e) {
          requireUpdate(reload, updateData);
        };

        xhr.send();
      }

      function requireUpdate(reload, updateData) {
        if (updateData && window.frameElement && window.frameElement.requireUpdate)
          window.frameElement.requireUpdate();
        if (reload) location.reload();
      }
      
      function initDateField(input, button, type) {
        var closeDateTimePicker = function() {
          if (button.dtpInitialized) {
            $(input).datetimepicker("destroy");
            button.dtpInitialized = false;

            // Desassociar evento de clique a janela.
            document.removeEventListener("click", closeDateTimePicker);
          }
        };
        
        $(input).attr('data-date', true);

        // Obter o pattern do formulário
        var dateFormat = mainform.DATE_PATTERN.toUpperCase();

        // Criar máscara no campo
        var inputMask = new Mask(dateFormat.toLowerCase(), "date");
        inputMask.attach(input);

        // Associar evento de clique ao ícone de calendário do campo.
        button.addEventListener("click", function(e) {
          e.stopPropagation();

          if (button.dtpInitialized) {
            closeDateTimePicker();
          } else {
            // Inicializar o DateTimePicker
            $(input).datetimepicker({
              // Idioma do DateTimePicker
              locale: parent.locale,

              // Formato da data
              format: dateFormat,

              // Não exibir o datetimepicker quando o input for somente leitura
              ignoreReadonly: false,

              // Exibir o botão para definir a data para o dia atual
              showTodayButton: true,

              // Não exibir o datetimepicker quando o input receber foco
              allowInputToggle: false,

              // Não utilizar a data atual
              useCurrent: false,

              // Ajeitar ícone de tempo
              icons: {
                time: "fas fa-clock" // Font Awesome
              },

              // Não exibir ao focar no input
              focusOnShow: false
            });

            // Marcar o DateTimePicker como inicializado
            button.dtpInitialized = true;

            // Associar evento de ao fechar do DateTimePicker
            $(input).on("dp.hide", function() {
              closeDateTimePicker();
            });

            // Associar evento de clique a janela.
            document.addEventListener("click", closeDateTimePicker);

            // Exibir o DateTimePicker
            $(input).datetimepicker("show");
          }
        });
      }

      addKeyEvent();
    </script>
  </head>
  <body class="w-100 h-100" style="overflow-x: hidden;">
    <iframe name="AdvancedQueryCommands" id="AdvancedQueryCommands" src="" class="d-none"></iframe>
    <form name="WFRQueryForm" method="get" action="search.do" target="AdvancedQueryCommands" onsubmit="return atLeastOneSelected(false);" class="w-100 h-100">
      <input name="fieldNum" type="hidden" value="0">
      <nav class="navbar navbar-expand sticky-top navbar-light bg-light border-bottom px-2 py-0" style="font-size: 1.15rem;">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav flex-row flex-wrap mr-auto">
            <li class="nav-item px-1 dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="fieldsDropdownLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-plus"></i>
              </a>
              <div class="dropdown-menu overflow-auto" style="max-height: 80vh;" aria-labelledby="fieldsDropdownLink">
                <h6 class="dropdown-header"><webrun:message key="LABEL.FIELDS"/></h6>
                <%
                  int formFieldsSize = formFields.size();
                  if (formFieldsSize == 0) {
                %>
                <a class="dropdown-item disabled" href="#">(<webrun:message key="LABEL.NO_FIELDS"/>)</a>
                <%
                  } else {
                    for (int i = 0; i < formFieldsSize; i++) {
                %>
                <a class="dropdown-item" href="#" onclick="addAdvancedField('<%=sys%>', <%=form.getCode()%>, '<%=((WFRMetaData) formFields.get(i)).getField()%>', 1);">
                  <%=Functions.stringToHTMLString(Functions.translate(((WFRMetaData)formFields.get(i)).getDescription(), form, wi.getSystem().getApplicationResources()))%>
                </a>
                <%
                    } 
                  }
                %>
              </div>
            </li>
            <li class="nav-item px-1<% if (gridMD.size() == 0) { %> disabled<% } %>" title="<webrun:message key="LABEL.REMOVE_FIELD"/>" data-toggle="tooltip"<% if (gridMD.size() > 0) { %> onclick="removeAdvancedField('<%=sys%>', <%=form.getCode()%>, MM_findObj('fieldNum').value);"<% } %>>
              <a class="nav-link<% if (gridMD.size() == 0) { %> disabled<% } %>" href="#"><i class="fas fa-minus"></i></a>
            </li>

            <li class="my-0 mx-2 d-inline-flex align-items-center justify-content-center border-left"></li>

            <li class="nav-item px-1" title="<webrun:message key="LABEL.SAVE_QUERY"/>" data-toggle="tooltip" onclick="return save('<%=sys%>', <%=form.getCode()%>);">
              <a class="nav-link" href="#"><i class="fas fa-save"></i></a>
            </li>
            <li class="nav-item px-1 dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="savedDropdownLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-folder-open"></i>
              </a>
              <div class="dropdown-menu overflow-auto" style="max-height: 80vh;" aria-labelledby="savedDropdownLink">
                <h6 class="dropdown-header"><webrun:message key="LABEL.CHOOSE_SEARCH_FIELD"/></h6>
                <%
                  int savedSize = saved.size();
                  if (savedSize == 0) {
                %>
                <a class="dropdown-item disabled" href="#">(<webrun:message key="LABEL.NONE_SAVED"/>)</a>
                <%
                  } else {
                    for (int i = 0; i < savedSize; i++) {
                %>
                <a class="dropdown-item" href="#" onclick="restoreSaved('<%=sys%>', <%=Functions.fromISOtoBASE(request.getParameter("formID"))%>, '<%=saved.get(i)%>');">
                  <%=saved.get(i)%>
                  <span class="generic-btn" role="button" title="<webrun:message key="LABEL.DELETE"/>" data-toggle="tooltip" onclick="event.stopPropagation();window.event.cancelBubble = true;removeSaved('<%=sys%>', <%=Functions.fromISOtoBASE(request.getParameter("formID"))%>, '${pageScope.confirm_remove}', '<%=saved.get(i)%>');">
                    <i class="fas fa-times"></i>
                  </span>
                </a>
                <%
                    } 
                  }
                %>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <div class="row p-3">
        <%
          Map<String, Integer> fieldsMap = new HashMap<String, Integer>();

          for (int i = 0; i < gridMD.size(); i++) {
            WFRMetaData c = (WFRMetaData)gridMD.get(i);

            if (field.length() > 0) field += ";";
            if (names.length() > 0) names += ";";

            if (fieldsMap.containsKey(c.getRealField())) {
              int total = fieldsMap.get(c.getRealField()) + 1;
              fieldsMap.put(c.getRealField(), total);
            } else {
              fieldsMap.put(c.getRealField(), 1);
            }

            names += c.getField();

            if (fieldsMap.containsKey(c.getRealField()) && fieldsMap.get(c.getRealField()) > 1) {
              field += (c.getRealField() + "$" + fieldsMap.get(c.getRealField()));
            } else {
              field += c.getRealField();
            }

            int ti = 3;
            try { ti = Integer.parseInt((String)types.get(c.getField())); } catch (Exception e) { }
        %>
        <div class="col-sm-4 mb-4">
          <div class="custom-control custom-radio mb-2 d-inline-block">
            <input type="radio" name="fieldNumSelect" id="field<%=i%>" onclick="MM_findObj('fieldNum').value = '<%=i%>';" value="<%=i%>"<% if (i == 0) { %> checked<% } %> class="custom-control-input">
            <label class="custom-control-label" for="field<%=i%>">
              <span><%=Functions.stringToHTMLString(Functions.translate(c.getDescription(), form, wi.getSystem().getApplicationResources()))%></span>
            </label>
          </div>

          <label class="sr-only" for="type-<%=i%>"><%=Functions.stringToHTMLString(Functions.translate(c.getDescription(), form, wi.getSystem().getApplicationResources()))%></label>
          <select name="type$<%=i%>" id="type-<%=i%>" class="custom-select" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'q$<%=i%>');">
            <% if (c.isString()) { %>
            <option value="2" <% if (ti == 2) { %>selected<%}%>><webrun:message key="LABEL.CONTAINING"/></option>
            <option value="3" <% if (ti == 3) { %>selected<%}%>><webrun:message key="LABEL.STARTING_WITH"/></option>
            <option value="4" <% if (ti == 4) { %>selected<%}%>><webrun:message key="LABEL.ENDING_WITH"/></option>
            <option value="1" <% if (ti == 1) { %>selected<%}%>>=</option>
            <% } if (c.isNumeric()) { %>
            <option value="17" <% if (ti == 17) { %>selected<% } %>>=</option>
            <option value="18" <% if (ti == 18) { %>selected<% } %>>&gt;</option>
            <option value="19" <% if (ti == 19) { %>selected<% } %>>&lt;</option>
            <option value="20" <% if (ti == 20) { %>selected<% } %>>&gt;=</option>
            <option value="21" <% if (ti == 21) { %>selected<% } %>>&lt;=</option>
            <option value="3" <% if (ti == 3) { %>selected<% } %>><webrun:message key="LABEL.STARTING_WITH"/></option>
            <% } if (c.isDate()) { %>
            <option value="10" <% if (ti == 10) { %>selected<% } %>>=</option>
            <option value="11" <% if (ti == 11) { %>selected<% } %>>&gt;</option>
            <option value="12" <% if (ti == 12) { %>selected<% } %>>&lt;</option>
            <option value="13" <% if (ti == 13) { %>selected<% } %>>&gt;=</option>
            <option value="14" <% if (ti == 14) { %>selected<% } %>>&lt;=</option>
            <% } %>
          </select>

          <% if (c.getDataField().getDataType().isTime() || c.getDataField().getDataType().isTimestamp() || c.getDataField().getDataType().isDate()) { %>
          <div class="input-group mt-2 h-auto">
            <input name="q$<%=i%>" id="q-<%=i%>" description-field="<%=c.getDescription()%>" type="text" class="form-control" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');">
              <div class="input-group-append date" id="calendar-<%=i%>" role="button" style="height: auto; cursor: pointer;">
              <i class="input-group-text d-flex align-items-center far fa-calendar"></i>
            </div>
          </div>
          <script type="text/javascript">
            <% if (c.getDataField().getDataType().isTime()) { %>
              initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 1);
            <% } else if (c.getDataField().getDataType().isTimestamp()) { %>
              initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 2);
            <% } else if (c.getDataField().getDataType().isDate()) { %>
              initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 0);
            <% } %>
          </script>
          <% } else if (c.getDataField().getDataType().isDouble()) { %>
          <input name="q$<%=i%>" id="q-<%=i%>" type="text" class="form-control mt-2" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');">
          <script type="text/javascript">new Mask("#.####", "number").attach(document.WFRQueryForm.q$<%=i%>);</script>
          <% } else if (c.getDataField().getDataType().isInteger()) { %>
          <input name="q$<%=i%>" id="q-<%=i%>" type="text" class="form-control mt-2" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');">
          <script type="text/javascript">new Mask("#", "number").attach(document.WFRQueryForm.q$<%=i%>);</script>
          <% } else { %>
          <input name="q$<%=i%>" id="q-<%=i%>" type="text" class="form-control mt-2" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');">
          <% } %>
        </div>
      <% } %>
      </div>

      <input name="sys" type="hidden" value="<%=request.getParameter("sys")%>">
      <input name="action" type="hidden" value="search">
      <input name="formID" type="hidden" value="<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>">
      <input name="componentID" type="hidden" value="-1">
      <input name="field" type="hidden" value="<%=field%>">
      <input name="names" type="hidden" value="<%=names%>">
      <input name="advancedQuery" type="hidden" value="true" id="advanced-query-state">
      <input name="showResults" type="hidden" value="false">
    </form>
    <script type="text/javascript">
      bootstrapInitTooltip('[data-toggle="tooltip"]');

      try {
        if (window.frameElement && window.frameElement.setClearState) {
          window.frameElement.setClearState(<% if (gridMD.size() > 0) { %>true<% } else { %>false<% } %>);
        }
      } catch (e) { }
    </script>
  </body>
</html>
</webrun:controller>