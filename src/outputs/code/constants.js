const extensionVersion = "5e046c731a54cbfc41f7d8b63300ffa020b3060e";

const classNames = ["green", "purple", "orange"];
const mainTsForClasses = {
    orange: "TMMachineLearning.onMLOrangeStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.hello), music.PlaybackMode.InBackground)\n})",
    purple: "TMMachineLearning.onMLPurpleStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.happy), music.PlaybackMode.InBackground)\n})",
    green: "TMMachineLearning.onMLGreenStart(function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.InBackground)\n})",
};

const pxtJson = JSON.stringify({
    name: "TMv1Integration",
    description: "",
    dependencies: {
        core: "*",
        microphone: "*",
        radio: "*", // Needed to compile.
        "TM Extension": `github:microbit-grace/tm-extension#${extensionVersion}`,
    },
    files: ["main.ts", "main.blocks", "README.md"],
    preferredEditor: "blocksprj",
});

export const initialMakeCodeProject = {
    header: {
        target: "microbit",
        targetVersion: "8.0.16",
        editor: "blocksprj",
        name: "TMv1Integration",
        meta: {},
        pubId: "",
        pubCurrent: false,
        id: "ad5c181a-e6d9-4f62-8e18-4fd34b7617f6",
        recentUse: 1759408610,
        modificationTime: 1759408610,
        path: "TMv1Integration",
        cloudCurrent: false,
        saveId: null,
        githubCurrent: false,
    },
    text: {
        "pxt.json": pxtJson,
        "README.md": "",
        "main.blocks":
            '<xml xmlns="https://developers.google.com/blockly/xml"><variables></variables><block type="TMMachineLearning_onMLGreenStart" x="0" y="0"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.giggle</field></shadow></value></block></statement></block><block type="TMMachineLearning_onMLPurpleStart" x="0" y="149"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.happy</field></shadow></value></block></statement></block><block type="TMMachineLearning_onMLOrangeStart" x="-3" y="308"><statement name="HANDLER"><block type="music_playable_play"><field name="playbackMode">music.PlaybackMode.InBackground</field><value name="toPlay"><shadow type="soundExpression_builtinPlayableSoundEffect"><field name="soundExpression">soundExpression.hello</field></shadow></value></block></statement></block></xml>',
        "main.ts": classNames
            .map((className) => mainTsForClasses[className])
            .join("\n"),
    },
};

export const makeCodeProjectsForCodePreview = classNames.map((className) => ({
    ...initialMakeCodeProject,
    text: {
        "pxt.json": pxtJson,
        "main.ts": mainTsForClasses[className],
    },
}));
