import parseOptions from "./parseOptions";
import Settings from "./Settings";

export interface IParseRegion {
  input:string,
  regionList:Array<{ id: string, region: VTTRegion }>,
  onRegion?: (region: VTTRegion) => void,
}


    // 3.4 WebVTT region and WebVTT region settings syntax
function parseRegion({ input, regionList, onRegion }:IParseRegion) {
  var settings = new Settings();

  parseOptions(input, function (k:string, v:string) {
    switch (k) {
    case "id":
      settings.set(k, v);
      break;
    case "width":
      settings.percent(k, v);
      break;
    case "lines":
      settings.integer(k, v);
      break;
    case "regionanchor":
    case "viewportanchor":
      var xy = v.split(',');
      if (xy.length !== 2) {
        break;
      }
      // We have to make sure both x and y parse, so use a temporary
      // settings object here.
      var anchor = new Settings();
      anchor.percent("x", xy[0]);
      anchor.percent("y", xy[1]);
      if (!anchor.has("x") || !anchor.has("y")) {
        break;
      }
      settings.set(k + "X", anchor.get("x"));
      settings.set(k + "Y", anchor.get("y"));
      break;
    case "scroll":
      settings.alt(k, v, ["up"]);
      break;
    }
  }, /=/, /\s/);

  // Create the region, using default values for any values that were not
  // specified.
  if (settings.has("id")) {
    var region = new VTTRegion();
    region.width = settings.get("width", 100);
    region.lines = settings.get("lines", 3);
    region.regionAnchorX = settings.get("regionanchorX", 0);
    region.regionAnchorY = settings.get("regionanchorY", 100);
    region.viewportAnchorX = settings.get("viewportanchorX", 0);
    region.viewportAnchorY = settings.get("viewportanchorY", 100);
    region.scroll = settings.get("scroll", "");
    // Register the region.
    onRegion && onRegion(region);
    // Remember the VTTRegion for later in case we parse any VTTCues that
    // reference it.
    regionList.push({
      id: settings.get("id"),
      region: region
    });
  }
};

export default parseRegion;