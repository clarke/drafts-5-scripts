const packingListFileName = '/PackingTemplate.json';
const xxDaysPattern = /^(.*) xx$/;
const configuredDaysPattern = /^Days: ([0-9]+)$/;

(() => {
    // Prompt to create a new draft
    let prompt = Prompt.create();
    prompt.addTextField("destination", "Destination:", "");
    prompt.addTextField("numberOfDays", "Number of days:", "");
    prompt.addButton("Continue");
    prompt.show();

    if (prompt.buttonPressed == 'Continue') {
        // Store the values from the initial prompt
        let destination = prompt.fieldValues.destination;
        let durationDays = prompt.fieldValues.numberOfDays;

        // Read the configuration file
        let fm = FileManager.createCloud();
        let myList =
            fm.readString(packingListFileName);
        if (!myList) {
            context.fail('Packing List does not yet exist!');
            return;
        }
        myList = JSON.parse(myList);

        // Setup a new draft
        let draft = new Draft();
        draft.content = "Trip to " + destination + "\n" + "Days: " + durationDays + "\n\n";
        draft.addTag("packing");

        // Prompt to select which sub-lists should be included
        var sublists = [];

        for (var k in myList) {
            if (myList.hasOwnProperty(k)) {
                sublists.push(k);
            }
        }

        let sublistPrompt = Prompt.create();
        sublistPrompt.addSelect('sublists', 'Include which sub-lists?', sublists, sublists, true);
        sublistPrompt.addButton('Add');
        sublistPrompt.show();
        if (sublistPrompt.buttonPressed == 'Add') {
            sublistPrompt.fieldValues.sublists.forEach(function (sublist) {
                let sublistLabel = sublist;
                let localDurationDays = 0;

                // Check to see if this list has a custom duration
                if (xxDaysPattern.test(sublist)) {
                    // Remove the ' xx' from the item
                    sublistLabel = sublist.replace(xxDaysPattern, "$1");
                    let localDaysPrompt = Prompt.create();
                    localDaysPrompt.addTextField("numberOfDays", "Number of days for " + sublistLabel + ":", "");
                    localDaysPrompt.addButton("Continue");
                    localDaysPrompt.show();
                    localDurationDays = localDaysPrompt.fieldValues.numberOfDays;
                }

                myList[sublist].items.forEach(function (item) {
                    var numberIndicator = '';
                    if (xxDaysPattern.test(item)) {
                        if (localDurationDays > 0) {
                            numberIndicator = ' x' + localDurationDays;
                        } else {
                            numberIndicator = ' x' + durationDays;
                        }
                        item = item.replace(xxDaysPattern, "$1");
                    }
                    draft.content = draft.content + "\n" + item + numberIndicator;
                });
            });
        }

        // Finally, update the draft with all of the new content
        draft.update();
    }

})();