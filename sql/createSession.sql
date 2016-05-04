-- TODO: query for user insertion in database
INSERT INTO sessions (username, token, type, expires) values(@email, @token, 'agent', @expires);