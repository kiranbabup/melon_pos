import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Box } from "@mui/material";
import LsService, { storageKey } from "../services/localstorage";
// import { useDispatch } from 'react-redux';
// import { authLogout } from "../actions/auth";

export default function Page404() {
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const handleLogout = () => {
    // dispatch(authLogout());
    LsService.removeItem(storageKey);
    navigate('/');
  };

  return (
    <Box>
      <Container>
        <Box sx={{ textAlign: "center", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="h3" paragraph>
            Sorry, page not found!
          </Typography>

          <Typography sx={{ color: "text.secondary" }}>Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your spelling.</Typography>

          <Box p={2} />

          <div>
            <Button size="large" variant="contained" onClick={() => handleLogout()} >
              Go to Login
            </Button>
          </div>
        </Box>
      </Container>
    </Box>
  );
}
