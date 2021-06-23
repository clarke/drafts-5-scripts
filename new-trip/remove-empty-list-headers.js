const headerInfoPattern = /^(Trip to|Days:)/;
const listHeaderPattern = /^\w/;
var newDraftLines = [];

var previousLineIsHeader = false;

for (var i=0; i<draft.lines.length; i++) {
    let line = draft.lines[i];

    // Ignore the line if it's a header line
    if (!headerInfoPattern.test(line)) {
        if (listHeaderPattern.test(line)) {

            if (previousLineIsHeader) {
                // if this line and the previous are header lines, remove the previous line.
                newDraftLines.pop();
            }
            previousLineIsHeader = true;
        } else {
            previousLineIsHeader = false;
        }
    }
    
    newDraftLines.push(line);
}

draft.content = newDraftLines.join("\n");
draft.update();