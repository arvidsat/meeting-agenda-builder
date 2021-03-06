Schedules = new Mongo.Collection("schedules");
Activities = new Mongo.Collection("activities");
Days = new Mongo.Collection("days");

testFunc = function() {
	console.log("leTest");
	loggedIn = true;
}

getSchedules = function(user) {
	schedules = Schedules.find({"owner": user._id}, {'sort': {'position': 1}}).fetch();

	return schedules;
}

getNumberOfSchedules = function(userID) {
	return Schedules.find({'owner': userID}).count();
}

getActivities = function(scheduleID, parentList) {
	return Activities.find({'scheduleID': scheduleID, 'parentList': parentList}, {'sort': {'position': 1}}).fetch();
}

getActivitiesInDay = function(dayID) {
	return Activities.find({'parentList': dayID}).fetch();
}

getNumberOfActivities = function(scheduleID) {
	return Activities.find({"scheduleID" : scheduleID}).count();
}

getActivity = function(activityID) {
	return Activities.findOne({'_id': activityID});
}

getNewActivityPosition = function(scheduleID, parentList) {
	return getActivities(scheduleID, parentList).length;
}

updateActivitiesPosition = function(parentList) {
	var activitiesIDArray = [];
	$('#' + parentList).find('li').each(function(){
		activitiesIDArray.push($(this).attr('id')); 
	});
	_.each(activitiesIDArray, function(activityID, index){
		Meteor.call("updateActivityPos", activityID, parentList, index);
	});
}

getDays = function(scheduleID) {
	return Days.find({'scheduleID': scheduleID}, {'sort': {'position': 1}}).fetch();
}

getNumberOfDays = function(scheduleID) {
	return Days.find({"scheduleID" : scheduleID}).count();
}

getDay = function(dayID) {
	return Days.findOne({'_id': dayID});
}

getNewDayPosition = function(scheduleID) {
	return getDays(scheduleID).length;
}

updateDaysPosition = function() {
	var daysIDArray = [];
	$('#daysList').find('.day').each(function(){
		daysIDArray.push($(this).attr('id')); 
	});
	_.each(daysIDArray, function(dayID, index) {
		Meteor.call("updateDayPos", dayID, index);
	});
}

getScheduleInfo = function(scheduleID) {
	schedule = Schedules.findOne(scheduleID);

	var scheduleInfo = {};

	scheduleInfo["id"] = schedule._id;
	scheduleInfo["scheduleTitle"] = schedule.scheduleTitle;
	scheduleInfo["owner"] = schedule.owner;

	return scheduleInfo;
}

getListPos = function(target) {
	if (target === "parkedActivities") {
		var position = $("#parkedActivities").offset();
		return position;
	}
}

getActivityHeight = function(length) {
	var activityTitleHeight = 24;
	var activityHeight = length * 1.5 + activityTitleHeight
	if (activityHeight > TOO_SHORT) {
		return activityHeight;
	} else {
		return activityTitleHeight;
	}
}

addActivityStartTimes = function(startTime, activities) {
	// Receives an array of days. Returns an array of days, with fields for activity start times added
	for (var i in activities) {
		activities[i]["activityStart"] = startTime; // add startTime to the activity object
		startTime += activities[i].activityLength; // increase the startTime variable for the next activity, with the length of this activity
	}
	return activities;
}

addDayNumbers = function(days) {
	// Receives an array of days. Returns an array of days, with fields for day number added.

	for (var i in days) {
		days[i]["dayNumber"] = parseInt(i) + 1;
	}

	return days;
}

addActivityNumbers = function(activities) {
	// Receives an array of activities. Returns an array of activities with fields for activity numbers added.

	for (var i in activities) {
		activities[i]["activityNumber"] = parseInt(i) + 1;
	}

	return activities;
}

dayLength = function(dayID) {
	var activities = getActivitiesInDay(dayID);
	var length = 0;
	for (var i in activities) {
		length += activities[i].activityLength;
	}

	return length;
}

minutesToHuman = function(inMinutes) {
	// Receives a number in minutes. Outputs a human-readable string formatted to HH:MM

	hours = "" + Math.floor(inMinutes/60);
	hours = zeroPadding(hours, 2);

	minutes = "" + inMinutes % 60;
	minutes = zeroPadding(minutes, 2);

	return hours + ":" + minutes;
}

minutesToHM = function(inMinutes) {
	hours = "" + Math.floor(inMinutes/60);
	hours = zeroPadding(hours, 2);

	minutes = "" + inMinutes % 60;
	minutes = zeroPadding(minutes, 2);

	return [hours, minutes];
}

hmToMinutes = function(hours, minutes) {
	return parseInt(hours) * 60 + parseInt(minutes);
}

zeroPadding = function(num, size) {
	// Adds zeroes to the beginning of a string

	while (num.length < size) {
		num = "0" + num;
	}

	return num;
}

numberList = function(start, end, step, padding) {
	var numList = []

	for (var i = start; i < end + 1; i = i + step) {
		if (padding) {
			num = zeroPadding("" + i, 2);
		} else {
			num = i;
		}
		numList.push(num);
	}

	return numList;
}

getCurrentYear = function() {
	var year = zeroPadding(new Date().getFullYear(), 4);
	return year;
}

getCurrentMonth = function() {
	var month = zeroPadding(new Date().getMonth() + 1, 2);
	return month;
}

getCurrentDay = function() {
	var day = zeroPadding(new Date().getDate(), 2);
	return day;
}

getDaysFromNow = function(date) {
	var currentDate = new Date(parseInt(getCurrentYear()), parseInt(getCurrentMonth()), parseInt(getCurrentDay()));
	var otherDate = new Date(parseInt(date.year), parseInt(date.month), parseInt(date.day));

	var timeDiff = otherDate.getTime() - currentDate.getTime();
	var dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

	return dayDiff;
}

getTemp = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	if(dayInWeatherRange(date)) {
		return (parseInt(Session.get("weather").list[getDaysFromNow(date)].temp.day) - 273).toString() + " °C";
	}
	return "none";
}

getWeatherDescription = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	if(dayInWeatherRange(date)) {
		return Session.get("weather").list[getDaysFromNow(date)].weather[0].description;
	}
	return "no description";
}

getWeatherImgRef = function(date) {
	date = typeof date !== 'undefined' ? date : {"year": getCurrentYear(), "month": getCurrentMonth(), "day": getCurrentDay() };

	if(dayInWeatherRange(date)) {
		return "http://openweathermap.org/img/w/" + Session.get("weather").list[getDaysFromNow(date)].weather[0].icon + ".png";
	}
	return "no description";
}

dayInWeatherRange = function(date) {
	if (Session.get("weather") === "") {
		return true;
	}
	var daysFromNow = getDaysFromNow(date);
	if(daysFromNow >= 0 && daysFromNow < Session.get("weather").cnt) {
		return true;
	} else {
		return false;
	}
}

trimInput = function(val) {
	return val.replace(/^\s*|\s*$/g, "");
}

validateEmail = function(email) {
	if (email == "") throw "E-mail is required.";
	if (!emailSyntax.test(email)) throw "Bad e-mail.";
	return true;
}

validatePassword = function(password) {
	if (password.length < 6) throw "Password must be ≥ 6 characters.";
	return true;
}

createUser = function(email, password) {
	Accounts.createUser({email: email, password: password}, function(error) {
		if (error) loginError(error.message);
		else login(email, password);
	});
}

getUserEmail = function() {
	return Meteor.user().emails[0].address;
}

forgotPassword = function(email) {
	Accounts.forgotPassword({email: email}, function(error) {
		if (error) loginError(error.message);
		else loginError("OK, check e-mail for reset instructions");
	});
}

getDiagramActivityHeightPercent = function(type, activities) {
	if (typeof activities === 'undefined') {
		return 0;
	}
	var length = 0;
	var totalLength = 0;
	for (var i in activities) {
		if (activities[i]["type"] === type) {
			length += activities[i]["activityLength"];
		}
		totalLength += activities[i]["activityLength"];
	}
	var percent = (length / totalLength) * 100;
	return percent;
}

resetPassword = function(resetToken, newPw) {
	Accounts.resetPassword(resetToken, newPw, function(error) {
		if (error) loginError(error.message);
	});
}

changePassword = function(oldPassword, newPassword) {
	Accounts.changePassword(oldPassword, newPassword, function(error) {
		if (error) loginError(error.message);
		else closeChangePassword();;
	});
}

activityTypesTranslation = {
	"presentation": "Presentation",
	"group_work": "Group work",
	"discussion": "Discussion",
	"break": "Break"
}
