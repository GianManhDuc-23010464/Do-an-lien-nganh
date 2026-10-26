package com.web.security;

import com.google.firebase.messaging.FirebaseMessaging;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:test.properties")
class WebSecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FirebaseMessaging firebaseMessaging;

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/voucher/admin/findAll-list")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/invoice/admin/find-all")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/statistic/admin/revenue-year").param("year", "2024")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/voucher/admin/create").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void notificationEndpointRequiresAdmin() throws Exception {
        mockMvc.perform(post("/api/notification/send").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(post("/api/invoice/user/create").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cartEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/cart/user/my-cart")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/cart/user/add").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicEndpointsAreOpen() throws Exception {
        mockMvc.perform(get("/api/banner/public/find-by-page").param("page", "0")).andExpect(status().isOk());
    }

    @Test
    void uploadRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/upload/file")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/public/upload-file")).andExpect(status().isNotFound());
    }

    @Test
    void unknownApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/some-unknown-endpoint")).andExpect(status().isForbidden());
    }

    @Test
    void paymentIpnIsPublic() throws Exception {
        mockMvc.perform(get("/api/payment/public/vnpay-ipn")).andExpect(status().isOk());
    }

    @Test
    void invalidTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/cart/user/my-cart").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isForbidden());
    }

    @Test
    void legacyCreateAdminEndpointIsGone() throws Exception {
        mockMvc.perform(get("/create")).andExpect(status().isNotFound());
    }
}
