(() => {
let prompt = Prompt.create();
prompt.addTextField("destination", "Destination:", "");
prompt.addTextField("numberOfDays", "Number of days:", "");
prompt.addButton("Okay");
prompt.show();
var destination = prompt.fieldValues["destination"];
var durationDays = prompt.fieldValues["numberOfDays"];

let draft = new Draft();
draft.content = "Trip to " + destination + "\n" + "Days: " + durationDays + "\n\n";
draft.addTag("packing");
draft.update();
editor.load(draft);
})()