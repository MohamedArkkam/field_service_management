package com.sitedirect.api.support;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Starts PostgreSQL via the Docker CLI (avoids docker-java / Testcontainers npipe issues on some
 * Docker Desktop installs). Used by integration tests; CI runners also have a working {@code docker}.
 */
public final class DockerPostgresSupport implements AutoCloseable {

    private final String containerId;
    private final int hostPort;

    private DockerPostgresSupport(String containerId, int hostPort) {
        this.containerId = containerId;
        this.hostPort = hostPort;
    }

    public static DockerPostgresSupport start() {
        requireDocker();
        int port = freePort();
        String containerId = exec(
                "docker",
                "run",
                "-d",
                "--rm",
                "-e",
                "POSTGRES_DB=sitedirect",
                "-e",
                "POSTGRES_USER=sitedirect",
                "-e",
                "POSTGRES_PASSWORD=sitedirect",
                "-p",
                port + ":5432",
                "postgres:16-alpine");
        waitUntilReady(containerId, Duration.ofSeconds(60));
        return new DockerPostgresSupport(containerId.trim(), port);
    }

    public String jdbcUrl() {
        return "jdbc:postgresql://localhost:" + hostPort + "/sitedirect";
    }

    public String username() {
        return "sitedirect";
    }

    public String password() {
        return "sitedirect";
    }

    @Override
    public void close() {
        try {
            exec("docker", "rm", "-f", containerId);
        } catch (Exception ignored) {
            // best-effort cleanup
        }
    }

    private static void requireDocker() {
        try {
            exec("docker", "version");
        } catch (Exception ex) {
            throw new IllegalStateException("Docker CLI is required for API integration tests", ex);
        }
    }

    private static void waitUntilReady(String containerId, Duration timeout) {
        long deadline = System.nanoTime() + timeout.toNanos();
        Exception last = null;
        while (System.nanoTime() < deadline) {
            try {
                String out = exec("docker", "exec", containerId, "pg_isready", "-U", "sitedirect", "-d", "sitedirect");
                if (out.contains("accepting")) {
                    return;
                }
            } catch (Exception ex) {
                last = ex;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted waiting for Postgres", ie);
            }
        }
        throw new IllegalStateException("Postgres container did not become ready", last);
    }

    private static int freePort() {
        try (ServerSocket socket = new ServerSocket(0)) {
            return socket.getLocalPort();
        } catch (Exception ex) {
            throw new IllegalStateException("Could not allocate free port", ex);
        }
    }

    private static String exec(String... command) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(90, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("Timed out: " + String.join(" ", command));
            }
            String output;
            try (BufferedReader reader =
                    new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                List<String> lines = new ArrayList<>();
                String line;
                while ((line = reader.readLine()) != null) {
                    lines.add(line);
                }
                output = String.join("\n", lines);
            }
            if (process.exitValue() != 0) {
                throw new IllegalStateException(
                        "Command failed (" + process.exitValue() + "): " + String.join(" ", command) + "\n" + output);
            }
            return output;
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Failed: " + String.join(" ", command), ex);
        }
    }
}
