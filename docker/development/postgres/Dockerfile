FROM postgres:latest


# Copy custom postgres configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Use custom configuration
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]