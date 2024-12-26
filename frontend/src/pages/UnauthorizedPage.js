import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-4">Unauthorized Access</h1>
      <p className="text-muted mb-4">
        You don't have permission to access this page. Please contact your administrator.
      </p>
    </Container>
  );
};