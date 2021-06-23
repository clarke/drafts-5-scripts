const completedTaskPattern = /^- \[x\] /;
const headerInfoPattern = /^(Trip to|Days:)/;
const listHeaderPattern = /^\w/;
var newDraftLines = [];

for (let i = 0; i < draft.lines.length; i++) {
    let line = draft.lines[i];

    if (!completedTaskPattern.test(line)) {
        newDraftLines.push(line);
    }
}

// Go back over the remaining items and check for empty lists
var previousLineIsHeader = false;
var finalDraftLines = [];

for (let i = 0; i < newDraftLines.length; i++) {
    let line = newDraftLines[i];

    // Ignore the line if it's a header line
    if (!headerInfoPattern.test(line)) {
        if (listHeaderPattern.test(line)) {
            if (previousLineIsHeader) {
                // if this line and the previous are header lines, remove the previous line.
                finalDraftLines.pop();
            }
            previousLineIsHeader = true;
        } else {
            previousLineIsHeader = false;
        }
    }

    finalDraftLines.push(line);
}

draft.content = finalDraftLines.join("\n");
draft.update();