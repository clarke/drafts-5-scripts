// Process Meeting Notes

const taskPrefix = "OF: ";

const emailTrigger = "EA-";


// Pre-defined email recipients
const emailRecipients = {
  "A": "anders@example.com",
  "B": "person@example.com"
}

// Keep a list of tasks to be sent via email
var emailTasks = {}

var emailRegexp = new RegExp(emailTrigger + "([^:]+): (.*)$");

// Turn EA-A: Buy more pigs
// into: ["anders@example.com", "Buy more pigs"]
function getEmailAndMessageFromLine(s) {
  var m = s.match(emailRegexp);

  if (m) {
    var emailKey = m[1];
    var message = m[2];

    var emailAddress = null;
    
    if (emailKey in emailRecipients) {
      emailAddress = emailRecipients[emailKey];
    } else if (emailKey.includes("@")) {
      emailAddress = emailKey;
    } else {
      console.log("Unable to find email address");
      return;
    }

    return [emailAddress, message];
  } else {
   console.log("Unable to parse email address and message from line");
  }
}

function removeLinePrefix(s, linePrefix) {
  var f       = (linePrefix),
      r       = "",
      re      = new RegExp(f, "g"),
      matches = s.match(re);

  if (matches) {
    return s.replace(re,r);
  }  
}

// Function for removing the task prefix
function removeTaskPrefix(s) {
  return removeLinePrefix(s, taskPrefix);
}

// Covenience function for performing callback urls
function doCallbackURL(url, params) {
  var cb = CallbackURL.create();
  cb.baseURL = url;

  for(var key in params) {
   cb.addParameter(key, params[key]);
  }

  var success = cb.open();
  if (success) {
    console.log("Event created");
  } else {
    console.log(cb.status);
    if (cb.status == "cancel") {
      context.cancel();
    } else {
      context.fail();
    }
  }
}

// Convenience function for sending email
function sendMail(recipient, subject, message) {

  if (recipient == null) {
    console.log("No recipient specified");
    context.fail();
  }

  var mail = Mail.create();
  
  mail.toRecipients = [recipient];
  mail.subject = subject;
  mail.body = message;
  
  var success = mail.send();
  if (!success) {
    console.log(mail.status);
    context.fail();
  }   
}

// Scan for the task prefix in the draft
var d = draft.content;
var lines = d.split("\n");
var n = '';

for (var line of lines) {
  // If the line includes the task prefix, 
  // we remove exclude it from the final notes
  if (line.includes(taskPrefix)) {

    // Remove the trigger from the line
    var task = removeTaskPrefix(line);

    // OmniFocus URL Action
    doCallbackURL("omnifocus://x-callback-url/paste", {
      "content": task,
      "target": "inbox"
    });
    console.log("Task sent to OmniFocus");
  } else if (line.includes(emailTrigger)) {
      var [emailAddress, message] = getEmailAndMessageFromLine(line);

      if (emailAddress in emailTasks) {
      	emailTasks[emailAddress].push(message);
      } else {
        emailTasks[emailAddress] = [message];
      }
  } else {
    n += line + "\n";
  }
}

// Send email tasks, if any
for (var emailAddress in emailTasks) {
  var message = emailTasks[emailAddress].join("\n");
  
  sendMail(emailAddress, draft.title + " - Tasks", message);
  console.log("Email sent to: " + emailAddress);
}

draft.content = n;
draft.update();

// Send the note to Bear
doCallbackURL("bear://x-callback-url/create", {
  "text": draft.content,
  "tags": "meeting notes"
});