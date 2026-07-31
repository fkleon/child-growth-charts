import o from 'ospec';

import {COLOURS, nextColour} from '../src/models/constants';
import {AppActions, AppState, ChildState} from '../src/models/state';

o.spec('Colours', () => {
  o('nextColour picks the first unused palette colour', () => {
    o(nextColour([])).equals(COLOURS[0]);
    o(nextColour([COLOURS[0]])).equals(COLOURS[1]);
    o(nextColour([COLOURS[1], COLOURS[0]])).equals(COLOURS[2]);
  });

  o('nextColour ignores undefined entries', () => {
    o(nextColour([undefined, COLOURS[0], undefined])).equals(COLOURS[1]);
  });

  o('nextColour cycles once the palette is exhausted', () => {
    o(nextColour(COLOURS)).equals(COLOURS[COLOURS.length % COLOURS.length]);
  });

  o('ChildState assigns a colour not used by siblings', () => {
    const child = ChildState([COLOURS[0]]);
    o(child.colourHex).equals(COLOURS[1]);
  });

  o('addChild assigns a colour distinct from existing children', () => {
    const state = AppState();
    state.children = [{...ChildState(), colourHex: COLOURS[0]}];
    const actions = AppActions(state);

    actions.addChild();

    o(state.children.length).equals(2);
    o(state.children[1].colourHex).equals(COLOURS[1]);
  });

  o('addChild does not override an explicitly provided colour', () => {
    const state = AppState();
    state.children = [];
    const actions = AppActions(state);

    actions.addChild({...ChildState(), colourHex: COLOURS[5]});

    o(state.children[0].colourHex).equals(COLOURS[5]);
  });
});
