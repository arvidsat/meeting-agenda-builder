Meteor.subscribe("schedules");
Meteor.subscribe("activities");
Meteor.subscribe("days");

Session.set("weatherError", "");
Session.set("message", null);

$(window).resize(function() {
	setContentSize();
});

openSchedule = function(scheduleID) {
	Session.set("currentSchedule", scheduleID);
}

closeSchedule = function() {
	Session.set("currentSchedule", null);
}

editActivity = function(activityID) {
	Session.set("editActivityModal", true);
	Session.set("activityBeingEdited", getActivity(activityID));
}

stopEditingActivity = function() {
	Session.set("editActivityModal", false);
	Session.set("deleteActivityModal", false);
	Session.set("activityBeingEdited", null);
}

editDay = function(dayID) {
	var dayBeingEdited = getDay(dayID);

	dayBeingEdited["dayNumber"] = dayBeingEdited.position + 1;
	dayBeingEdited["startTimeHM"] = minutesToHM(dayBeingEdited.startTime);
	Session.set("dayBeingEdited", dayBeingEdited);

	if (dayBeingEdited.date) Session.set("addDate", true);
	else Session.set("addDate", false);

	Session.set("editDayModal", true);
}

stopEditingDay = function() {
	Session.set("editDayModal", false);
	Session.set("deleteDayModal", false);
	Session.set("dayBeingEdited", null);
}

stopAddingDay = function() {
	Session.set("addDayModal", false);
	Session.set("addDate", false);
}

diagramExplanation = function() {
	Session.set("diagramExplanation", true);
}

closeDiagramExplanation = function() {
	Session.set("diagramExplanation", false);
}

stopDeletingSchedule = function() {
	Session.set("deleteScheduleModal", false);
	Session.set("scheduleToDelete", null);
}

closeChangePassword = function() {
	Session.set("changePassword", false);
	Session.set("loginError", null);
}

resetLoginForm = function() {
	Session.set("createAccount", false);
	Session.set("loginError", null);
	Session.set("forgotPassword", false);
	Session.set("resetPassword", false);
}

loginError = function(message) {
	Session.set("loginError", message);
}

login = function(email, password) {
	Meteor.loginWithPassword(email, password, function(error) {
		if (error) loginError(error.message);
		else {
			resetLoginForm();
		}
	});
}
		
logout = function() {
	closeSchedule();
	stopDeletingSchedule();
	resetLoginForm();

	Meteor.logout();
}

setContentSize = function() {
	if (!Session.get("viewAsList")) {
		var contentHeight = $(window).height() - HEADER_HEIGHT - 2*STANDARD_SPACE;
		var parkedActivitiesListHeight = contentHeight - DAY_HEADER_HEIGHT;
		var dayActivityListHeight = parkedActivitiesListHeight - 4*STANDARD_SPACE;
		$("#parkedActivitiesView").height(contentHeight + "px");
		$("#daysViewContainer").height(contentHeight + "px");
		$(".dayActivityList").css("max-height", dayActivityListHeight + "px");
		$(".parkedActivityList").height(parkedActivitiesListHeight - 5 + "px");
	} else {
		var contentHeight = $(window).height() - HEADER_HEIGHT - STANDARD_SPACE;
		$('.listViewFrame').height(contentHeight + "px");
	}
		
}

getDaysViewWidth = function() {
	var width = (DAY_WIDTH + STANDARD_SPACE) * getNumberOfDays(Session.get("currentSchedule"));
	return width;
}

messageBox = function(message) {
	Session.set("message", message);
}

closeMessageBox = function() {
	Session.set("message", null)
}