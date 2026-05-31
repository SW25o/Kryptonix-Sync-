package com.kryptonix.sync.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.stickyHeader
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kryptonix.sync.crypto.E2EEncryptor
import java.text.SimpleDateFormat
import java.util.*

data class MessageState(
    val id: String,
    val senderId: String,
    val isFromSelf: Boolean,
    val encryptedPayload: String,
    val timestamp: Long,
    val deliverState: Int // 0=Sent, 1=Delivered, 2=Read
)

/**
 * Enterprise-grade Jetpack Compose screen rendering Kryptonix Sync's encrypted dashboard.
 * Includes unique ID discovery, reactive secure chat list layout, sticky date grouping,
 * and simulated decryption flows on user frames.
 */
@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class)
@Composable
fun ChatDashboardScreen(
    clientBusinessId: String,
    onSendMessage: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var activeChatRoomPartner by remember { mutableStateOf<String?>(null) }
    var searchErrorState by remember { mutableStateOf<String?>(null) }
    val messagesList = remember { mutableStateListOf<MessageState>() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0E17))
    ) {
        // App top branding
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "KRYPTONIX SYNC",
                color = Color(0xFF00E5FF),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
            
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF141A29))
                    .border(1.dp, Color(0xFF00E5FF).copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = clientBusinessId,
                    color = Color(0xFF00E5FF),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Alphanumeric Identifier Search Bar
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it.toUpperCase(Locale.ROOT)
                    searchErrorState = null // Clear error on change
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search Business ID (e.g., KTX-ADMIN-MAIN)", color = Color.Gray) },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF00E5FF),
                    unfocusedBorderColor = Color(0xFF141A29),
                    focusedLabelColor = Color(0xFF00E5FF)
                )
            )

            // Discovery and Verify action
            Button(
                onClick = {
                    if (searchQuery == "KTX-ADMIN-MAIN") {
                        activeChatRoomPartner = "KTX-ADMIN-MAIN"
                        searchErrorState = null
                    } else {
                        searchErrorState = "INVALID BUSINESS ID: Enterprise records could not resolve matches for \"$searchQuery\"."
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF141A29)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Verify & Establish Secure Direct Tunnel", color = Color(0xFF00E5FF))
            }

            // Material 3 Error container
            searchErrorState?.let { err ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2B1014)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = err,
                        color = Color(0xFFFF5252),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }
        }

        HorizontalDivider(color = Color(0xFF141A29), thickness = 1.dp, modifier = Modifier.padding(vertical = 8.dp))

        // Secured Channel View Area
        if (activeChatRoomPartner == null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No Active Secure Tunnel. Scan an Administrator ID above.",
                    color = Color.Gray,
                    fontSize = 13.sp,
                    fontFamily = FontFamily.SansSerif
                )
            }
        } else {
            // Group and render secure messages using grouping for sticky headers
            val groupedMessages = messagesList.groupBy { 
                SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault()).format(Date(it.timestamp)) 
            }

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                reverseLayout = false
            ) {
                groupedMessages.forEach { (date, messagesInDay) ->
                    stickyHeader {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = date,
                                color = Color.Gray,
                                fontSize = 11.sp,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF141A29))
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    items(messagesInDay) { msg ->
                        ChatBubbleLayout(msg)
                    }
                }
            }
        }
    }
}

@Composable
fun ChatBubbleLayout(msg: MessageState) {
    val showSelf = msg.isFromSelf
    val decryptedText = try {
        E2EEncryptor.decrypt(msg.encryptedPayload)
    } catch (e: Exception) {
        "UNABLE_TO_DECRYPT_PAYLOAD"
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalAlignment = if (showSelf) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 12.dp,
                        topEnd = 12.dp,
                        bottomStart = if (showSelf) 12.dp else 4.dp,
                        bottomEnd = if (showSelf) 4.dp else 12.dp
                    )
                )
                .background(if (showSelf) Color(0xFF142035) else Color(0xFF1E1428))
                .border(
                    1.dp, 
                    if (showSelf) Color(0xFF00E5FF).copy(alpha = 0.2f) else Color(0xFF9E00FF).copy(alpha = 0.2f),
                    RoundedCornerShape(
                        topStart = 12.dp,
                        topEnd = 12.dp,
                        bottomStart = if (showSelf) 12.dp else 4.dp,
                        bottomEnd = if (showSelf) 4.dp else 12.dp
                    )
                )
                .padding(12.dp)
        ) {
            Column {
                // Decrypted human viewable content
                Text(
                    text = decryptedText,
                    color = Color.White,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Under-the-hood AES-GCM Ciphertext debug tag
                Text(
                    text = "CIPHER: " + msg.encryptedPayload.take(24) + "...",
                    color = Color(0xFF00E5FF),
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(2.dp))

                // Time status alignment
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val formattedTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(msg.timestamp))
                    Text(
                        text = formattedTime,
                        color = Color.LightGray.copy(alpha = 0.6f),
                        fontSize = 10.sp
                    )
                    
                    if (msg.isFromSelf) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = when (msg.deliverState) {
                                1 -> "✓✓" // Delivered
                                2 -> "✓✓" // Read (cyan highlight)
                                else -> "✓" // Sent
                            },
                            color = if (msg.deliverState == 2) Color(0xFF00E5FF) else Color.LightGray.copy(alpha = 0.6f),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
