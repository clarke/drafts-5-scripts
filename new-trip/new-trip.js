const packingListFileName = '/PackingTemplate.json';
var xxDaysPattern = /^(.*) xx$/;

(() => {
    // Parse the configuration file
    let fm = FileManager.createCloud();
    let myList =
        fm.readString(packingListFileName);
    if (!myList) {
        context.fail('Packing List does not yet exist!');
        return;
    }
    myList = JSON.parse(myList);

    let prompt = Prompt.create();
    prompt.addTextField("destination", "Destination:", "");
    prompt.addTextField("numberOfDays", "Number of days:", "");
    prompt.addButton("Continue");
    prompt.show();

    if (prompt.buttonPressed == 'Continue') {

        var destination = prompt.fieldValues["destination"];
        var durationDays = prompt.fieldValues["numberOfDays"];

        let draft = new Draft();
        draft.content = "Trip to " + destination + "\n" + "Days: " + durationDays + "\n\n";
        draft.addTag("packing");
        draft.update();
        editor.load(draft);
        editor.activate();


        // Prompt to select which sub-lists should be included
        let sublists = [];
        // for (var k in myList) sublists.push(k);

        for (var k in myList){
            if (myList.hasOwnProperty(k)) {
                sublists.push(k);
            }
        }

        let sublistPrompt = Prompt.create();
        sublistPrompt.addSelect('sublists', 'Include which sub-lists?', sublists, sublists, true);
        sublistPrompt.addButton('Add')
        sublistPrompt.show();
        if (sublistPrompt.buttonPressed == 'Add') {
            sublistPrompt.fieldValues['sublists'].forEach(function(sublist) {

                let localDurationDays = 0;

                // Check to see if this list has a custom duration
                if (xxDaysPattern.test(sublist)) {
                    // Remove the ' xx' from the item
                    chosenLabel = sublist.replace(xxDaysPattern, "$1");
                    let p = Prompt.create();
                    p.addTextField("numberOfDays", "Number of days for " + sublist + ":", "");
                    p.addButton("Okay");
                    p.show();
                    localDurationDays = p.fieldValues["numberOfDays"];
                }

                // Prompt to select which items to create on this sublist
                let itemsPrompt = Prompt.create();
                itemsPrompt.addSelect('items', sublist, myList[sublist]['items'], myList[sublist]['items'], true);
                itemsPrompt.addButton('Add')
                itemsPrompt.show();

                if (itemsPrompt.buttonPressed == 'Add') {
                    // Add the section header
                    draft.content = draft.content + "\n" + sublist + ' ' + myList[sublist]['emoji'];
                    itemsPrompt.fieldValues['items'].forEach(function(item) {
                        var numberIndicator = '';
                        if (xxDaysPattern.test(item)) {
                            if (localDurationDays > 0) {
                                numberIndicator = ' x' + localDurationDays;
                            } else {
                                numberIndicator = ' x' + durationDays;
                            }
                            item = item.replace(xxDaysPattern, "$1");
                        }
                        draft.content = draft.content + "\n" + '- [ ] ' + item + numberIndicator;
                    });
                    draft.update();
                }
            })
        }
        draft.update();
    }
})()