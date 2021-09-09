import Box from '@material-ui/core/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  activeTab: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, activeTab, index, ...other } = props;

  if (index !== activeTab) return null;
  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      <Box p={3}>
        {children}
      </Box>
    </div>
  );
}

export default TabPanel;