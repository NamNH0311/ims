import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import "@fontsource/be-vietnam-pro";
import GroupsIcon from "@mui/icons-material/Groups";

import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import {
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { Link, useNavigate } from "react-router-dom";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ email: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    setUser({ email: userEmail, role: userRole });
    console.log(userRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div
      className="vh-100"
      style={{
        display: "flex",
        flexDirection: "column",
        width: collapsed ? "80px" : "250px",
        transition: "width 0.3s ease",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        collapsedWidth="80px"
        style={{
          flex: 1,
          minHeight: 0, // Prevents flex item from growing beyond container
        }}
      >
        <Menu closeOnClick>
          <MenuItem
            icon={<MenuIcon />}
            onClick={() => setCollapsed(!collapsed)}
          ></MenuItem>
          {user.role === "Admin" && (
            <MenuItem icon={<PersonIcon />} component={<Link to="/user" />}>
              User Management
            </MenuItem>
          )}
          <MenuItem icon={<WorkIcon />} component={<Link to="/job" />}>
            Job Management
          </MenuItem>
          <MenuItem
            icon={<CalendarMonthIcon />}
            component={<Link to="/interview" />}
          >
            Interview Management
          </MenuItem>

          <MenuItem icon={<LocalOfferIcon />} component={<Link to="/offer" />}>
            Offer Management
          </MenuItem>

          <MenuItem icon={<GroupsIcon />} component={<Link to="/candidate" />}>
            Candidate Management
          </MenuItem>
          <MenuItem>
            <IconButton
              aria-label="Account"
              aria-describedby={id}
              onClick={handleClick}
            >
              <AccountCircleIcon />
            </IconButton>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Typography sx={{ p: 2 }}>
                <nav aria-label="User account actions">
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemIcon>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              {user.email || "User Email"}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemIcon>
                          <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              Change Password
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </nav>
                <Divider />
                <nav aria-label="Logout">
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                          <ExitToAppRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </nav>
              </Typography>
            </Popover>
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Updated Footer with responsive styling */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f1f1f1",
          width: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontSize: collapsed ? "12px" : "14px",
          textAlign: "center",
        }}
      >
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {collapsed ? (
            <span style={{ fontWeight: "bold" }}>{user.role}</span>
          ) : (
            <>
              Login as{" "}
              <span style={{ fontWeight: "bold" }}>
                {user.role || "No role found"}
              </span>
            </>
          )}
        </Typography>
      </div>
    </div>
  );
}
