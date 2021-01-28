<%@ page import="wfr.exceptions.ExceptionMessage"%>
<%@ page import="wfr.com.WFRSystem, wfr.util.*, java.util.*" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLAdminInterface" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<c:set var="SEPARADOR" value="@@"/>
<c:set var="DEFAULT_NAME" value="itemValue"/>
<%
  WFRConfig.setContext(getServletConfig().getServletContext(), request);
  Resources resources = Resources.getInstance(request);
  HTMLAdminInterface wfr = null;
  try {
    wfr = (HTMLAdminInterface) request.getSession().getAttribute("WFRAdmin");
    if (wfr == null) {
      wfr = new HTMLAdminInterface(resources);
      request.getSession().setAttribute("WFRAdmin", wfr);
    }

    wfr.checkJSPAccess(out);
  } catch (Exception e) {
    Functions.showException(out, e, resources, null);
    return;
  }
  
  Logger logger = Logger.getLogger(this.getClass());
  Config wfrConfig = WFRConfig.config();

  List<String> groupNameList = wfrConfig.getGroupsNames();
  request.setAttribute("groupsNamesList", groupNameList);
  String groupName = Functions.fromISOtoBASE(request.getParameter("groupName"));
  if (groupName != null && !groupName.equals("")) {
    Map<String, List<String>> items = wfrConfig.getMapItems(groupName);
    pageContext.setAttribute("items", items);
  }

  String userAgent = request.getHeader("user-agent");
  boolean isInternetExplorer = (userAgent != null && (userAgent.contains("rv:11.0") || userAgent.contains("Trident")));
%>
<!DOCTYPE html>
<html class="w-100 h-100">
<head>
  <meta charset="${webrun:charset()}">
  <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title><webrun:message key="LABEL.SYSTEM_CONFIGURATION"/></title>
  <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
  <%= HTMLConstants.BOOTSTRAP_CSS %>
  <%= HTMLConstants.ICONS_CSS %>
  <%= HTMLConstants.FORM_CSS %>
  <%= HTMLConstants.FORM_RESPONSIVE_CSS %>
  <%= HTMLConstants.JQUERY_JS %>
  <%= HTMLConstants.BOOTSTRAP_JS %>
  <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
  <webrun:import src="wfr.js"/>
  <webrun:import src="components/HTMLMessage.js"/>
  <script type="text/javascript">
  var selectedItems = [];
  var modifiedItems = [];

  var tooltipParams = {
    delay: { "show": 500, "hide": 0 },
    trigger: "hover"
  };

  function getSelection(name, type) {
    if (selectedItems.length == 0) return null;
    name = name.toLowerCase();
    for (var i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].type == type && (
          (type == "group" && selectedItems[i].group.toLowerCase() == name) ||
          (type == "param" && selectedItems[i].field.toLowerCase() == name))) {
        return selectedItems[i];
      }
    }

    return null;
  }

  function isGroupItemSelected(groupName) {
    if (selectedItems.length == 0) return false;
    groupName = groupName.toLowerCase();
    for (var i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].group && selectedItems[i].group.toLowerCase() == groupName) {
        return true;
      }
    }

    return false;
  }

  function isSelected(name, type) {
    return getSelection(name, type) != null;
  }

  function selectItem(type, group, field, listItem, checkbox) {
    selectedItems.push({
      type: type,
      group: group,
      field: field,
      listItem: listItem,
      checkbox: checkbox });
    updateLayout();
  }

  function unselectItem(name, type) {
    if (selectedItems.length == 0) return null;
    name = name.toLowerCase();
    var index = -1;
    for (var i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].type == type && (
          (type == "group" && selectedItems[i].group.toLowerCase() == name) ||
          (type == "param" && selectedItems[i].field.toLowerCase() == name))) {
        index = i;
        break;
      }
    }

    if (index != -1) {
      selectedItems.splice(index, 1);
      updateLayout();
    }
  }

  function unselectAll() {
    if (selectedItems.length == 0) return;
    for (var i = 0; i < selectedItems.length; i++) {
      selectedItems[i].checkbox.checked = false;
    }

    selectedItems = [];
    updateLayout();
  }

  function unselectAllFrom(groupName) {
    if (selectedItems.length == 0) return;
    groupName = groupName.toLowerCase();

    var elements = [];
    for (var i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].type == "param" && selectedItems[i].group && selectedItems[i].group.toLowerCase() == groupName) {
        elements.push(selectedItems[i]);
      }
    }

    if (elements.length > 0) {
      for (var i = 0; i < elements.length; i++) {
        var index = selectedItems.indexOf(elements[i]);
        if (index != -1) selectedItems.splice(index, 1);
      }
    }
  }

  function updateLayout() {
    var deleteButton = document.getElementById("delete-button");
    if (selectedItems.length > 0) deleteButton.className = "btn btn-danger mr-2"; <%-- Bootstrap --%>
    else deleteButton.className = "d-none"; <%-- Bootstrap --%>

    var saveButton = document.getElementById("save-button");
    if (modifiedItems.length > 0) saveButton.disabled = false;
    else saveButton.disabled = true;
  }

  function collapseAll() {
    $(".collapse").collapse('hide'); <%-- Bootstrap --%>
  }

  function collapseGroup(groupName) {
    var groupCollapseDiv = document.getElementById(groupName + "-group-collapse");
    if (groupCollapseDiv) $(groupCollapseDiv).collapse('hide'); <%-- Bootstrap --%>
  }

  function highlightText(text, query) {
    var textLowercase = text.toLowerCase();
    var queryLowercase = query.toLowerCase();
    var queryIndex = textLowercase.indexOf(queryLowercase);
    if (queryIndex != -1) return text.substring(0, queryIndex) + "<b>" + text.substring(queryIndex, queryIndex + queryLowercase.length) + "</b>" + text.substring(queryIndex + queryLowercase.length, textLowercase.length);
    return text;
  }

  function handleItemCheckbox(listItem, checkbox, type, name, group) {
    var selected = isSelected(name, type);
    if (checkbox.checked && !selected) {
      if (type == "group") unselectAllFrom(name);
      selectItem(type, group, name, listItem, checkbox);

      if (type == "group") {
        var groupCollapseDiv = document.getElementById(name + "-group-collapse");
        var groupCheckboxes = groupCollapseDiv.querySelectorAll('input[type="checkbox"]');
        if (groupCheckboxes && groupCheckboxes.length > 0) {
          for (var i = 0; i < groupCheckboxes.length; i++) {
            groupCheckboxes[i].checked = false;
            groupCheckboxes[i].disabled = true;
          }
        }
      }
    } else if (!checkbox.checked && selected) {
      unselectItem(name, type);

      if (type == "group") {
        var groupCollapseDiv = document.getElementById(name + "-group-collapse");
        var groupCheckboxes = groupCollapseDiv.querySelectorAll('input[type="checkbox"]');
        if (groupCheckboxes && groupCheckboxes.length > 0) {
          for (var i = 0; i < groupCheckboxes.length; i++) {
            groupCheckboxes[i].disabled = false;
          }
        }
      }
    }
  }

  function handleSaveButton() {
    if (modifiedItems.length == 0) return;
    var modificationsList = document.getElementById("modifications-list");
    modificationsList.innerHTML = "";

    for (var i = 0; i < modifiedItems.length; i++) {
      var modification = modifiedItems[i];
      var modificationItem = document.createElement("li");
      modificationItem.className = "list-group-item text-muted"; <%-- Bootstrap --%>

      var displayParamName = modification.group + " -> " + modification.param;

      if (modification.type == "value") {
        if (modification.action == "modify") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.MODIFY_FIELD_VALUE" js="true"/>"
            .replace("{0}", "<b>" + displayParamName + "</b>")
            .replace("{1}", "<b>" + modification.firstValue + "</b>")
            .replace("{2}", "<b>" + modification.value + "</b>");
        } else if (modification.action == "delete") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.REMOVE_FIELD_VALUE" js="true"/>"
          .replace("{0}", "<b>" + modification.value + "</b>")
          .replace("{1}", "<b>" + displayParamName + "</b>");
        } else if (modification.action == "add") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.ADD_FIELD_VALUE" js="true"/>"
          .replace("{0}", "<b>" + modification.value + "</b>")
          .replace("{1}", "<b>" + displayParamName + "</b>");
        }
      } else if (modification.type == "param") {
        if (modification.action == "add") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.ADD_FIELD" js="true"/>"
            .replace("{0}", "<b>" + modification.param + "</b>")
            .replace("{1}", "<b>" + modification.group + "</b>");
        } else if (modification.action == "delete") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.REMOVE_FIELD" js="true"/>"
          .replace("{0}", "<b>" + modification.param + "</b>")
          .replace("{1}", "<b>" + modification.group + "</b>");
        }
      } else if (modification.type == "group") {
        if (modification.action == "delete") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.REMOVE_GROUP" js="true"/>"
          .replace("{0}", "<b>" + modification.group + "</b>");
        } else if (modification.action == "add") {
          modificationItem.innerHTML = (i + 1) + ". <webrun:message key="INFO.ADD_GROUP" js="true"/>"
          .replace("{0}", "<b>" + modification.group + "</b>");
        }
      }

      modificationsList.appendChild(modificationItem);
    }

    unselectAll();
    collapseAll();

    var commitModalBody0 = document.getElementById("commit-modal-body-0");
    var commitModalBody1 = document.getElementById("commit-modal-body-1");
    var commitModalBody2 = document.getElementById("commit-modal-body-2");
    var commitModalFooter = document.getElementById("commit-modal-footer");
    var commitModalTitle = document.getElementById("commit-modal-title");

    commitModalBody0.className = "modal-body p-0"; <%-- Bootstrap --%>
    commitModalBody1.className = "d-none"; <%-- Bootstrap --%>
    commitModalBody2.className = "d-none"; <%-- Bootstrap --%>
    commitModalFooter.className = "d-block"; <%-- Bootstrap --%>

    commitModalTitle.innerHTML = "<webrun:message key="INFO.CONFIRM_MODIFICATIONS" js="true"/>";

    $("#commit-modal").modal("show"); <%-- Bootstrap --%>
  }

  function undoModifications() {
    unselectAll();
    collapseAll();

    modifiedItems = [];
    selectedItems = [];
    updateLayout();

    $("#commit-modal").modal("hide"); <%-- Bootstrap --%>

    setTimeout(function() {
      location.reload();
    }, 200);
  }

  function handleSaveCommitButton() {
    var commitModalBody0 = document.getElementById("commit-modal-body-0");
    var commitModalBody1 = document.getElementById("commit-modal-body-1");
    var commitModalBody2 = document.getElementById("commit-modal-body-2");
    var commitModalFooter = document.getElementById("commit-modal-footer");
    var commitModalTitle = document.getElementById("commit-modal-title");
    var commitModalPreloader = document.getElementById("commit-modal-preloader");
    var commitModalCheckmark = document.getElementById("commit-modal-checkmark");

    commitModalBody0.className = "d-none"; <%-- Bootstrap --%>
    commitModalBody1.className = "modal-body d-flex align-items-center justify-content-center p-5"; <%-- Bootstrap --%>
    commitModalBody2.className = "d-none"; <%-- Bootstrap --%>
    commitModalFooter.className = "d-none"; <%-- Bootstrap --%>
    commitModalTitle.innerHTML = "";

    commitModalCheckmark.className = "d-none"; <%-- Bootstrap --%>
    commitModalPreloader.className = "spinner-border text-secondary"; <%-- Bootstrap --%>

    $.post(getAbsolutContextPath() + "admincore?action=commitConfigChanges", {
      changes: JSON.stringify(modifiedItems)
    }, function(response) {
      if (response == "1") {
        commitModalCheckmark.className = "success-checkmark d-block"; <%-- Bootstrap --%>
        commitModalPreloader.className = "d-none"; <%-- Bootstrap --%>

        modifiedItems = [];
        selectedItems = [];
        updateLayout();

        setTimeout(function() {
          $("#commit-modal").modal("hide"); <%-- Bootstrap --%>
          setTimeout(function() {
            location.reload();
          }, 200);
        }, 1000);
      } else {
        commitModalBody0.className = "d-none"; <%-- Bootstrap --%>
        commitModalBody1.className = "d-none"; <%-- Bootstrap --%>
        commitModalBody2.className = "modal-body"; <%-- Bootstrap --%>

        var commitModalDetails = document.getElementById("commit-modal-detais");
        commitModalDetails.value = response;
      }
    }).fail(function() {
      new HTMLMessage().showErrorMessage("<webrun:message key="ERROR.CONNECTION_FAILED" js="true"/>", null, null, null, 'DB', true);
    });
  }

  function handleAddParamButton(group) {
    var nameModalTitle = document.getElementById("name-modal-title");
    var nameModalInput = document.getElementById("name-modal-input");
    var nameModalInpuLabel = document.getElementById("name-modal-input-label");
    var nameModalAddButton = document.getElementById("name-modal-add-button");

    nameModalTitle.innerHTML = "<webrun:message key="LABEL.ADD_FIELD"/>";
    nameModalInpuLabel.innerHTML = "<webrun:message key="LABEL.FIELD_NAME"/>";
    nameModalInput.placeholder = "<webrun:message key="LABEL.FIELD_NAME"/>";
    nameModalInput.value = "";

    nameModalAddButton.onclick = function() {
      if (nameModalInput.value.length > 0) {
        setModification("param", "add", group, nameModalInput.value);
        $("#name-modal").modal("hide");
        loadGroupParams(group);
      }
    };

    $("#name-modal").modal("show");
  }

  function handleAddGroupButton() {
    var nameModalTitle = document.getElementById("name-modal-title");
    var nameModalInput = document.getElementById("name-modal-input");
    var nameModalInpuLabel = document.getElementById("name-modal-input-label");
    var nameModalAddButton = document.getElementById("name-modal-add-button");

    nameModalTitle.innerHTML = "<webrun:message key="LABEL.ADD_GROUP"/>";
    nameModalInpuLabel.innerHTML = "<webrun:message key="LABEL.GROUP_NAME"/>";
    nameModalInput.placeholder = "<webrun:message key="LABEL.GROUP_NAME"/>";
    nameModalInput.value = "";

    nameModalAddButton.onclick = function() {
      if (nameModalInput.value.length > 0) {
        setModification("group", "add", nameModalInput.value);
        var groupsList = document.getElementById("groups-list");
        designGroupElement(groupsList, nameModalInput.value, true, false, null, null);
        $("#name-modal").modal("hide");
      }
    };

    $("#name-modal").modal("show");
  }

  function designGroupElement(div, elementData, selectable, subitem, query, parentGroup) {
    var isGroup = !elementData.values;
    var name = elementData.name ? elementData.name : elementData;
    var group = parentGroup;
    var displayName = name;

    if (name && name.indexOf(" -> ") != -1) {
      var parts = name.split(" -> ");
      displayName = name;
      if (!group) group = parts[0];
      name = parts[1];
    }

    if (query) displayName = highlightText(displayName, query);

    var groupItem = document.createElement("div");
    groupItem.className = "list-group-item p-0 list-group-item-action d-flex align-items-stretch"; <%-- Bootstrap --%>
    groupItem.style.cursor = "default";
    div.appendChild(groupItem);

    if (query) {
      groupItem.onclick = function() {
        var searchInput = document.getElementById("search");
        searchInput.value = "";
        searchParams(null);

        if (group != null) {
          loadGroupParams(group, name);
        } else if (name != null) {
          loadGroupParams(name);
        }
      };
    } else if (isGroup) {
      groupItem.onclick = function() {
        collapseAll();
        loadGroupParams(name);
      };
    }

    if (selectable) {
      var groupSelectArea = document.createElement("div");
      groupSelectArea.className = "d-flex align-items-center justify-content-center border-right px-1 py-2 bg-light"; <%-- Bootstrap --%>
      groupSelectArea.style.cursor = "default";
      groupItem.appendChild(groupSelectArea);

      var groupSpinnerBaseDiv = document.createElement("div");
      groupSpinnerBaseDiv.className = "d-none"; <%-- Bootstrap --%>
      groupSpinnerBaseDiv.id = name + "-group-preloader";
      groupSpinnerBaseDiv.style.width = "1rem";
      groupSpinnerBaseDiv.style.height = "1rem";
      groupSelectArea.appendChild(groupSpinnerBaseDiv);

      var groupSpinnerSpan = document.createElement("span");
      groupSpinnerSpan.className = "sr-only"; <%-- Bootstrap --%>
      groupSpinnerSpan.innerHTML = "<webrun:message key="LABEL.LOADING" js="true"/>...";
      groupSpinnerBaseDiv.appendChild(groupSpinnerSpan);

      var groupCheckboxBaseDiv = document.createElement("div");
      groupCheckboxBaseDiv.className = "custom-control custom-checkbox ml-2"; <%-- Bootstrap --%>
      groupCheckboxBaseDiv.id = (isGroup ? name + "-group-checkbox-base" :  group + "-" + name + "-checkbox-base");
      groupSelectArea.appendChild(groupCheckboxBaseDiv);

      var groupCheckbox = document.createElement("input");
      groupCheckbox.type = "checkbox"; <%-- Bootstrap --%>
      groupCheckbox.id = (isGroup ? name + "-group-checkbox" : group + "-" + name + "-checkbox");
      groupCheckbox.className = "custom-control-input"; <%-- Bootstrap --%>

      if (!isGroup && isSelected(group, "group")) {
        groupCheckbox.checked = false;
        groupCheckbox.disabled = true;
      } else {
        groupCheckbox.checked = isSelected(name, isGroup ? "group" : "param");
        groupCheckbox.disabled = false;
      }

      groupCheckboxBaseDiv.appendChild(groupCheckbox);

      var groupCheckboxLabel = document.createElement("label");
      groupCheckboxLabel.className = "custom-control-label"; <%-- Bootstrap --%>
      groupCheckboxLabel.setAttribute("for", groupCheckbox.id);
      groupCheckboxBaseDiv.appendChild(groupCheckboxLabel);

      groupSelectArea.onclick = function(e) {
        e.stopPropagation();
        groupCheckbox.click();
      };

      groupCheckboxLabel.onclick = function(e) {
        e.stopPropagation();
      };

      groupCheckbox.onchange = function(e) {
        handleItemCheckbox(groupItem, groupCheckbox, isGroup ? "group" : "param", name, group);
      };

      if (elementData.values) {
        groupItem.onclick = function(e) {
          e.stopPropagation();
          groupCheckbox.click();
        };
      }
    }

    var nameElement = null;
    if (isGroup) {
      var groupNameSpan = document.createElement("span");
      groupNameSpan.className = "px-3 py-2"; <%-- Bootstrap --%>
      groupNameSpan.innerHTML = displayName;
      groupItem.appendChild(groupNameSpan);
      nameElement = groupNameSpan;

      var groupCollapseDiv = document.createElement("div");
      groupCollapseDiv.className = "collapse"; <%-- Bootstrap --%>
      groupCollapseDiv.id = name + "-group-collapse";
      div.appendChild(groupCollapseDiv);

      var groupParamsList = document.createElement("div");
      groupParamsList.className = "list-group"; <%-- Bootstrap --%>
      groupParamsList.id = name + "-group-params";
      groupCollapseDiv.appendChild(groupParamsList);
    } else {
      var paramModification = getModifiedItem("param", group, name, j);
      if (paramModification != null && paramModification.action == "delete") {
        groupItem.style.opacity = "0.2";
        groupItem.style.pointerEvents = "none";
      }

      var paramItemRow = document.createElement("div");
      paramItemRow.className = "row no-gutters w-100 px-3 py-2"; <%-- Bootstrap --%>
      groupItem.appendChild(paramItemRow);

      if (subitem) {
        var paramItemColumn0 = document.createElement("div");
        paramItemColumn0.className = "col-1"; <%-- Bootstrap --%>
        paramItemRow.appendChild(paramItemColumn0);
      }

      var paramItemColumn1 = document.createElement("div");
      paramItemColumn1.className = (subitem ? "col-6 col-sm-4" : "col-6 col-sm-5") + " pr-3 d-flex align-items-center"; <%-- Bootstrap --%>
      paramItemRow.appendChild(paramItemColumn1);

      var paramItemColumn2 = document.createElement("div");
      paramItemColumn2.className = (subitem ? "col-5 col-sm-7" : "col-6 col-sm-7") + " d-flex flex-column"; <%-- Bootstrap --%>
      paramItemRow.appendChild(paramItemColumn2);

      var paramItemName = document.createElement("label");
      paramItemName.className = "responsive-label mb-0"; <%-- Bootstrap --%>
      paramItemName.innerHTML = displayName;
      paramItemName.setAttribute("title", name);
      paramItemName.setAttribute("data-toggle", "tooltip"); <%-- Bootstrap --%>
      paramItemColumn1.appendChild(paramItemName);
      nameElement = paramItemName;

      $(paramItemName).tooltip(tooltipParams);

      var totalValues = 0;
      for (var j = 0; j < elementData.values.length; j++) {
        var modification = getModifiedItem("value", group, name, j);
        if (!modification || modification.action != "delete") {
          var value = designElementValue(paramItemColumn2, group, name, totalValues,
            modification ? modification.value : elementData.values[j]);

          value[2].onclick = (function(index, elems) {
            return function(e) {
              e.stopPropagation();
              hideTooltips();
              setModification("value", "delete", group, name, index, elems[1].value);
              paramItemColumn2.removeChild(elems[0]);
              totalValues--;
            };
          })(totalValues, value);

          totalValues++;
        }
      }

      var modifications = getModificationsFor("value", group, name);
      if (modifications && modifications.length > 0) {
        for (var k = 0; k < modifications.length; k++) {
          if (modifications[k].action == "add") {
            var value = designElementValue(paramItemColumn2, group, name, totalValues, modifications[k].value);

            value[2].onclick = (function(index, elems) {
              return function(e) {
                e.stopPropagation();
                hideTooltips();
                setModification("value", "delete", group, name, index, elems[1].value);
                paramItemColumn2.removeChild(elems[0]);
                totalValues--;
              };
            })(totalValues, value);

            totalValues++;
          }
        }
      }

      var addValueButton = document.createElement("span");
      addValueButton.className = "d-flex align-items-center generic-btn fas fa-plus mr-3"; <%-- Font Awesome --%>
      addValueButton.setAttribute("title", "<webrun:message key="LABEL.ADD_FIELD" js="true"/>");
      addValueButton.setAttribute("data-toggle", "tooltip"); <%-- Bootstrap --%>
      groupItem.appendChild(addValueButton);

      $(addValueButton).tooltip(tooltipParams);

      addValueButton.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        setModification("value", "add", group, name, totalValues);
        var value = designElementValue(paramItemColumn2, group, name, totalValues);

        value[2].onclick = (function(index, elems) {
          return function(e) {
            e.stopPropagation();
            hideTooltips();
            setModification("value", "delete", group, name, index, elems[1].value);
            paramItemColumn2.removeChild(elems[0]);
            totalValues--;
          };
        })(totalValues, value);

        totalValues++;
      };
    }

    return [groupItem, name, nameElement];
  }

  function handleDeleteButton() {
    if (selectedItems.length == 0) return false;
    for (var i = 0; i < selectedItems.length; i++) {
      var item = selectedItems[i];

      if (item.listItem) {
        item.listItem.style.opacity = "0.5";
        item.listItem.style.pointerEvents = "none";
      }

      if (item.checkbox) {
        item.checkbox.checked = false;
      }

      if (item.type == "group") {
        setModification("group", "delete", item.group);
        collapseGroup(item.group);
      } else if (item.type == "param") {
        setModification("param", "delete", item.group, item.field);
      }
    }

    unselectAll();
  }

  function getModifiedItem(type, group, param, valueIndex) {
    if (modifiedItems.length == 0) return null;
    group = group.toLowerCase();
    if (param) param = param.toLowerCase();

    var modifications = [];
    for (var i = 0; i < modifiedItems.length; i++) {
      if (modifiedItems[i].type == type && modifiedItems[i].group.toLowerCase() == group &&
         (param === undefined || param === null || modifiedItems[i].param.toLowerCase() == param) &&
         (valueIndex === undefined || valueIndex === null || modifiedItems[i].valueIndex === valueIndex)) {
        modifications.push(modifiedItems[i]);
      }
    }

    return modifications.length > 0 ? modifications[modifications.length - 1] : null;;
  }

  function getModificationsFor(type, group, param) {
    if (modifiedItems.length == 0) return null;
    group = group.toLowerCase();
    if (param) param = param.toLowerCase();

    var modifications = [];
    for (var i = 0; i < modifiedItems.length; i++) {
      if (modifiedItems[i].type == type && modifiedItems[i].group.toLowerCase() == group.toLowerCase() &&
         (!param || modifiedItems[i].param.toLowerCase() == param)) {
        modifications.push(modifiedItems[i]);
      }
    }

    return modifications;
  }

  function setModification(type, action, group, param, valueIndex, valueValue, firstValue) {
    var modification = getModifiedItem(type, group, param, valueIndex);
    if (modification) {
      if (action != "modify") {
        if (modification.action == "add" && action == "delete") {
          var index = modifiedItems.indexOf(modification);
          if (index != -1) {
            modifiedItems.splice(index, 1);
            updateLayout();
          }

          return false;
        } else {
          modification.action = action;
        }
      }

      modification.value = valueValue;

      if (modification.action == "modify" && modification.firstValue && modification.value == modification.firstValue) {
        var index = modifiedItems.indexOf(modification);
        if (index != -1) {
          modifiedItems.splice(index, 1);
          updateLayout();
        }
      }
    } else {
      modifiedItems.push({
        type: type,
        action: action,
        group: group,
        param: param,
        valueIndex: valueIndex,
        value: valueValue,
        firstValue: firstValue });
      updateLayout();
    }
  }

  function designElementValue(div, groupName, paramName, valueIndex, valueValue) {
    var valueInputGroup = document.createElement("div");
    valueInputGroup.className = "input-group" + (valueIndex > 0 ? " mt-2" : ""); <%-- Bootstrap --%>
    div.appendChild(valueInputGroup);

    var valueInput = document.createElement("input");
    valueInput.type = (paramName.toLowerCase() == "senha" || paramName.toLowerCase() == "password") ? "password" : "text";
    valueInput.className = "form-control"; <%-- Bootstrap --%>
    if (valueValue) valueInput.value = valueValue;
    valueInputGroup.appendChild(valueInput);

    valueInput.oninput = function() {
      setModification("value", "modify", groupName, paramName, valueIndex, valueInput.value, valueValue);
    };

    var valueInputAppend = document.createElement("div");
    valueInputAppend.className = "input-group-append"; <%-- Bootstrap --%>
    valueInputGroup.appendChild(valueInputAppend);

    var removeValueButton = document.createElement("button");
    removeValueButton.type = "button";
    removeValueButton.className = "btn btn-danger px-2 py-0"; <%-- Bootstrap --%>
    removeValueButton.setAttribute("title", "<webrun:message key="LABEL.REMOVE_FIELD" js="true"/>");
    removeValueButton.setAttribute("data-toggle", "tooltip"); <%-- Bootstrap --%>
    valueInputAppend.appendChild(removeValueButton);

    $(removeValueButton).tooltip(tooltipParams);

    var removeValueButtonIcon = document.createElement("i");
    removeValueButtonIcon.className = "fas fa-trash-alt"; <%-- Font Awesome --%>
    removeValueButton.appendChild(removeValueButtonIcon);

    valueInput.onclick = function(e) {
      e.stopPropagation();
    };

    return [valueInputGroup, valueInput, removeValueButton];
  }

  function loadGroupParams(groupName, focusField) {
    if (focusField) focusField = focusField.toLowerCase();
    var focusFieldElem = null, focusFieldNameElem = null;

    var groupCollapseDiv = document.getElementById(groupName + "-group-collapse");
    var groupPreloaderDiv = document.getElementById(groupName + "-group-preloader");
    var groupCheckboxBaseDiv = document.getElementById(groupName + "-group-checkbox-base");
    var groupCheckboxBaseDivClass = groupCheckboxBaseDiv.className;
    var groupParamsDiv = document.getElementById(groupName + "-group-params");
    var groupParamsDivClass = groupParamsDiv.className;

    groupPreloaderDiv.className = "spinner-border text-secondary mx-2"; <%-- Bootstrap --%>
    groupCheckboxBaseDiv.className = "d-none"; <%-- Bootstrap --%>
    groupParamsDiv.className = "d-none"; <%-- Bootstrap --%>
    groupParamsDiv.innerHTML = "";

    $.get(getAbsolutContextPath() + "admincore?action=getConfigGroupParams&group=" + URLEncode(groupName, "GET"),
      function(response) {
        if (response && response.params) {
          for (var i = 0; i < response.params.length; i++) {
            var item = designGroupElement(groupParamsDiv, response.params[i], true, true, null, groupName);
            if (focusField && item[1].toLowerCase().indexOf(focusField) != -1) {
              focusFieldElem = item[0];
              focusFieldNameElem = item[2];
            }
          }

          shouldOpenGroup = true;
        }

        var modifications = getModificationsFor("param", groupName);
        if (modifications && modifications.length > 0) {
          for (var k = 0; k < modifications.length; k++) {
            if (modifications[k].action == "add") {
              var item = designGroupElement(groupParamsDiv, { name: modifications[k].param, values: [] }, true, true, null, groupName);
              if (focusField && item[1].toLowerCase().indexOf(focusField) != -1) {
                focusFieldElem = item[0];
                focusFieldNameElem = item[2];
              }
            }
          }
        }

        var addParamItem = document.createElement("a");
        addParamItem.href = "#";
        addParamItem.className = "list-group-item px-4 py-2 list-group-item-action bg-light d-flex align-items-center justify-content-center"; <%-- Bootstrap --%>
        groupParamsDiv.appendChild(addParamItem);

        var addParamItemSpan = document.createElement("span");
        addParamItemSpan.className = "text-muted;" <%-- Bootstrap --%>
        addParamItemSpan.innerHTML = "<webrun:message key="LABEL.NEW_PARAMETER" js="true"/>...";
        addParamItem.appendChild(addParamItemSpan);

        addParamItem.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          handleAddParamButton(groupName);
        };

        groupPreloaderDiv.className = "d-none"; <%-- Bootstrap --%>
        groupCheckboxBaseDiv.className = groupCheckboxBaseDivClass;
        groupParamsDiv.className = groupParamsDivClass;

        $(groupCollapseDiv).collapse('show'); <%-- Bootstrap --%>
        $(groupCollapseDiv).on("hidden.bs.collapse", function () { <%-- Bootstrap --%>
          $(this).unbind("hidden.bs.collapse"); <%-- Bootstrap --%>
            groupParamsDiv.innerHTML = "";
        });

        if (focusFieldElem) {
          focusFieldElem.scrollIntoView(true);
          if (focusFieldNameElem.innerHTML.indexOf("<b>") == -1) {
            focusFieldNameElem.innerHTML = "<b>" + focusFieldNameElem.innerHTML + "</b>";
          }
        }
      }).fail(function() {
        new HTMLMessage().showErrorMessage("<webrun:message key="ERROR.CONNECTION_FAILED" js="true"/>", null, null, null, 'DB', true);
      });
  }

  function searchParams(name) {
    collapseAll();

    var searchHeader = document.getElementById("search-header");
    var searchBody = document.getElementById("search-body");
    var groupsList = document.getElementById("groups-list");
    var groupsActionsList = document.getElementById("groups-actions-list");

    var searchList = document.getElementById("search-list");
    var searchPreloader = document.getElementById("search-preloader");

    if (!name || name.length == 0) {
      searchBody.className = "d-none"; <%-- Bootstrap --%>
      groupsList.className = "list-group list-group-flush"; <%-- Bootstrap --%>
      groupsActionsList.className = "list-group list-group-flush"; <%-- Bootstrap --%>
      searchHeader.className = "card-body border-top py-1"; <%-- Bootstrap --%>
      searchList.innerHTML = "";
    } else {
      if (searchBody.className == "d-none") {
        groupsList.className = "d-none"; <%-- Bootstrap --%>
        groupsActionsList.className = "d-none"; <%-- Bootstrap --%>
        searchBody.className = "d-flex align-items-center justify-content-center p-4"; <%-- Bootstrap --%>
        searchHeader.className = "card-body border-top border-bottom py-1"; <%-- Bootstrap --%>
  
        searchList.className = "d-none"; <%-- Bootstrap --%>
        searchPreloader.className = "spinner-border text-secondary m-4"; <%-- Bootstrap --%>
      }

      $.get(getAbsolutContextPath() + "admincore?action=searchConfig&search=" + URLEncode(name, "GET"),
        function(response) {
          searchList.innerHTML = "";

          var foundGroups = (response.foundGroups && response.foundGroups.length > 0);
          var foundParams = (response.foundParams && response.foundParams.length > 0);

          if (response && response !== "0" && (foundGroups || foundParams)) {
            if (foundGroups) {
              for (var i = 0; i < response.foundGroups.length; i++) {
                designGroupElement(searchList, response.foundGroups[i], false, false, name);
              }
            }

            if (foundParams) {
              for (var i = 0; i < response.foundParams.length; i++) {
                var foundParam = response.foundParams[i];
                designGroupElement(searchList, foundParam.group + " -> " + foundParam.param, false, false, name, foundParam.group);
              }
            }

            searchList.className = "list-group list-group-flush"; <%-- Bootstrap --%>
            searchBody.className = "card-body p-0"; <%-- Bootstrap --%>
            searchPreloader.className = "d-none"; <%-- Bootstrap --%>
          } else {
            searchList.className = "d-flex p-4"; <%-- Bootstrap --%>
            searchBody.className = "card-body p-0"; <%-- Bootstrap --%>
            searchPreloader.className = "d-none"; <%-- Bootstrap --%>

            var infoSpan = document.createElement("span");
            infoSpan.className = "text-muted text-center w-100"; <%-- Bootstrap --%>
            infoSpan.innerHTML = "<webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS" js="true"/>";
            searchList.appendChild(infoSpan);
          }
        }).fail(function() {
          searchList.innerHTML = "";
        });
    }
  }

  function hideTooltips() {
    $('[data-toggle="tooltip"]').tooltip("hide");
  }

  $(document).ready(function() {
    $("#search").on("input", function() {
      searchParams(this.value);
    });

    $("#delete-button").click(function() {
      handleDeleteButton();
    });

    $("#save-button").click(function() {
      handleSaveButton();
    });

    $("#commit-button").click(function() {
      handleSaveCommitButton();
    });

    updateLayout();
  });
  </script>
</head>
<body class="w-100 h-100 bg-light">
  <div class="container px-md-0 h-100">
    <div class="row justify-content-center align-items-center h-100">
      <div class="col-sm-12<% if (isInternetExplorer) { %> h-100<% } %> d-flex justify-content-center align-items-center flex-column flex-nowrap position-relative">
        <div class="card bg-white position-relative w-100 shadow" id="main-card" style="max-width: 40rem;">
          <div class="card-body">
            <h5 class="card-title mb-2"><webrun:message key="LABEL.CONFIG_PARAMS"/></h5>
            <h5 class="text-muted mb-0"><webrun:message key="LABEL.GROUPS"/></h5>
          </div>

          <div class="card-body border-top border-bottom d-flex flex-row flex-nowrap align-items-center px-3 py-1" id="search-header">
            <i class="fas fa-search text-muted mr-3"></i>
            <div class="flex-fill">
              <input type="text" id="search" class="form-control-plaintext" style="outline: 0;" placeholder="<webrun:message key="JS.LABEL.CHAT_SEARCH"/>...">
            </div>
          </div>

          <div class="list-group list-group-flush" id="groups-list">
            <c:forEach items="${groupsNamesList}" var="groupName">
              <div onclick="collapseAll(); loadGroupParams('<c:out value="${groupName}"/>');" class="list-group-item p-0 list-group-item-action d-flex align-items-center border-top-0" style="cursor: default;" id="<c:out value="${groupName}"/>-group">
                <div class="d-flex align-items-center justify-content-center h-100 border-right px-1 py-2 bg-light" onclick="event.stopPropagation(); document.getElementById('<c:out value="${groupName}"/>-group-checkbox').click();">
                  <div class="d-none" role="status" id="<c:out value="${groupName}"/>-group-preloader" style="width: 1rem; height: 1rem;">
                    <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
                  </div>
                  <div class="custom-control custom-checkbox ml-2" id="<c:out value="${groupName}"/>-group-checkbox-base">
                    <input type="checkbox" class="custom-control-input" id="<c:out value="${groupName}"/>-group-checkbox" onchange="handleItemCheckbox(document.getElementById('<c:out value="${groupName}"/>-group'), this, 'group', '<c:out value="${groupName}"/>', '<c:out value="${groupName}"/>');">
                    <label class="custom-control-label" for="<c:out value="${groupName}"/>-group-checkbox" onclick="event.stopPropagation();"></label>
                  </div>
                </div>
                <span class="px-3 py-2"><c:out value="${groupName}"/></span>
              </div>
              <div class="collapse" id="<c:out value="${groupName}"/>-group-collapse">
                <div class="list-group" id="<c:out value="${groupName}"/>-group-params">
                    
                </div>
              </div>
            </c:forEach>
          </div>
          <div class="list-group list-group-flush" id="groups-actions-list">
            <a href="#" class="list-group-item px-4 py-2 list-group-item-action bg-light border-0 d-flex align-items-center justify-content-center" onclick="handleAddGroupButton();">
              <span><webrun:message key="LABEL.NEW_GROUP"/>...</span>
            </a>
          </div>

          <div class="d-none" id="search-body">
            <div class="d-none" role="status" id="search-preloader">
              <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
            </div>
            <div class="d-none" id="search-list">
              
            </div>
          </div>

          <div class="card-footer bg-white border-top px-md-4 py-md-3 d-flex justify-content-end">
            <a href="indexConfig.jsp" class="btn btn-secondary mr-2" role="button"><webrun:message key="LABEL.BACK"/></a>
            <button type="button" class="d-none" id="delete-button"><webrun:message key="LABEL.DELETE"/></button>
            <button type="button" class="btn btn-primary" id="save-button"><webrun:message key="LABEL.SAVE"/></button>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="commit-modal" tabindex="-1" role="dialog" aria-labelledby="commit-modal-title" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-white">
          <h5 class="modal-title" id="commit-modal-title"></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>" id="commit-modal-close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body p-0" id="commit-modal-body-0">
          <ul class="list-group list-group-flush" id="modifications-list">
            
          </ul>
        </div>

        <div class="d-none" id="commit-modal-body-1">
          <div id="commit-modal-checkmark">
            <div class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
            </div>
            <label class="w-100 mt-3 text-center text-success" style="font-size: 1.2rem;"></label>
          </div>
          <div class="spinner-border text-secondary" role="status" id="commit-modal-preloader">
            <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
          </div>
        </div>

        <div class="d-none" id="commit-modal-body-2">
          <div class="media">
            <i class="fas fa-times text-danger align-self-start ml-2 mr-4" style="font-size: 4rem;"></i>
            <div class="media-body">
              <p><webrun:message key="ERROR.ERROR_NOT_SPECIFIED"/></p>
              <textarea class="form-control" id="commit-modal-detais" style="font-size: 0.8rem; height: 137px;" readonly="readonly"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div id="commit-modal-footer">
            <button type="button" class="btn btn-secondary" onclick="undoModifications();"><webrun:message key="LABEL.UNDO"/></button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="cancel-button"><webrun:message key="LABEL.NO"/></button>
            <button type="button" class="btn btn-primary" id="commit-button"><webrun:message key="LABEL.YES"/></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="name-modal" tabindex="-1" role="dialog" aria-labelledby="name-modal-title" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-white">
          <h5 class="modal-title" id="name-modal-title"><webrun:message key="LABEL.ADD_FIELD"/></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>" id="name-modal-close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group position-relative row mb-0">
            <label for="name-modal-input" id="name-modal-input-label" class="col-sm-4 col-form-label"><webrun:message key="LABEL.FIELD_NAME"/></label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="name-modal-input" placeholder="<webrun:message key="LABEL.FIELD_NAME"/>">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal"><webrun:message key="LABEL.CANCEL"/></button>
          <button type="button" class="btn btn-primary" id="name-modal-add-button"><webrun:message key="LABEL.ADD"/></button>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
