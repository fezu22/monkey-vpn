FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/monkey-vpn .

FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=builder /out/monkey-vpn /app/monkey-vpn
ENV PORT=8080 DB_PATH=/data/monkey.db
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/monkey-vpn"]
