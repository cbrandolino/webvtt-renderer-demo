import { AppBar, Tabs, Tab } from "@material-ui/core";
import { Fragment, ReactElement, Children, useState } from "react";
import Panel from './Panel';

const TabPanels = (
  { labels, children }:
  { labels: Array<string>, children:Array<ReactElement> }
) => {
  const [activeTab, setTab] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Fragment>
      <AppBar position="static">
        <Tabs value={activeTab} onChange={handleChange} aria-label="simple tabs example">
          {
            labels.map(label => <Tab label={label} key={label} />)
          }
        </Tabs>
      </AppBar>

      {
        Children.map(children, (child:ReactElement, i:number):ReactElement => 
          <Panel index={i} activeTab={activeTab}>
            { child }
          </Panel>
        )
      }
    </Fragment>
  )

};

export default TabPanels;