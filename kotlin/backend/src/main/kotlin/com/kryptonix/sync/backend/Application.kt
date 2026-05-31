package com.kryptonix.sync.backend

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import io.ktor.http.*
import com.kryptonix.sync.backend.routes.registerSyncRoutes

/**
 * Enterprise-grade Ktor Server application entrypoint.
 * Hosts synchronized websocket endpoints, REST bridges for administrative web portal ingestion,
 * and maintains Firebase synchronization triggers for instant delivery callbacks (FCM).
 */
fun main() {
    embeddedServer(Netty, port = 3000, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        anyHost() // Restrict in enterprise production contexts
    }

    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }

    routing {
        // Base administrative diagnostic route
        get("/") {
            io.ktor.server.response.respond(
                mapOf(
                    "service" to "Kryptonix Sync Middleware Gateway",
                    "status" to "ACTIVE",
                    "version" to "1.8.0-RELEASE",
                    "keystore_health" to "SECURE"
                )
            )
        }

        // Register secure web-to-mobile dashboard bridges
        registerSyncRoutes()
    }
}
