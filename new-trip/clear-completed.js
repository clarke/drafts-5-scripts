const completedTaskPattern = /^- \[x\] /;
var newDraftContent = "";

for (var i=0; i<draft.lines.length; i++) {
    let line = draft.lines[i];

    if (!completedTaskPattern.test(line)) {
        newDraftContent = newDraftContent + line + "\n";
    }
}

draft.content = newDraftContent;
draft.update();