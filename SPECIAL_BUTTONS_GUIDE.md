# Special Buttons Manual Configuration Guide

## Overview
The POS system now uses a manual special buttons configuration system instead of auto-extracting from screen.xml. This gives you complete control over which special buttons appear in the interface.

## Configuration File
Location: `XML/special-buttons.xml`

## How to Add Special Buttons

1. **Find the button XML in screen.xml**
   - Look through the screen.xml file for buttons you want to include
   - Copy the entire `<Button>` element

2. **Add to special-buttons.xml**
   - Paste the button XML between the `<SpecialButtons>` tags
   - Separate multiple buttons with blank lines for readability

3. **Regenerate JSON**
   - Run: `node scripts/generateImageJson.js`
   - This will update the products.json file with your manual buttons

4. **Restart server**
   - Run: `npm start`
   - Visit http://localhost:3000 to see your changes

## Example Button Structure
```xml
<SpecialButtons>
    <Button title="VOID\nITEM" bitmap="Modifiers_VoidLine.png" 
            textup="WHITE" textdn="LIGHTRED" bgup="LIGHTRED" bgdn="WHITE">
        <Action type="onclick" workflow="WF_DoVoidLineEx"/>
    </Button>

    <Button title="Multi\nOrder" bitmap="G1_MLTORDOFF.png">
        <Action type="onclick" workflow="WF_MultiOrder"/>
        <Action type="onactivate" workflow="WF_ShowBtnMultiOrd">
            <Parameter name="ButtonNumber" value="0"/>
        </Action>
    </Button>
</SpecialButtons>
```

## Current Configuration
The file currently contains 3 example buttons:
- VOID ITEM - Void line items
- Multi Order - Handle multiple orders
- Grill - Access grill functions

## Tips
- Keep button titles short (2 lines max with \n for line breaks)
- Include bitmap references for button images
- Color properties (textup, textdn, bgup, bgdn) control appearance
- Actions define what happens when buttons are clicked
- Parameters provide additional data to workflows

## No Automatic Filtering
Unlike the old system, manual buttons are not filtered - whatever you add will appear in the Special tab. This gives you complete control but requires careful curation.
