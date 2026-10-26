package com.web.security.jwt;

import com.web.entity.User;
import com.web.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Đọc JWT, rồi lấy user và quyền <b>từ database</b> (không tin quyền ghi trong token),
 * nên tài khoản bị khóa hoặc bị đổi quyền có hiệu lực ngay.
 */
@Slf4j
public class JwtAuthenticationFilter extends GenericFilterBean {

    private final JwtTokenProvider tokenProvider;

    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        try {
            String jwt = getJwtFromRequest((HttpServletRequest) request);
            if (StringUtils.hasText(jwt) && !"null".equals(jwt) && tokenProvider.validateToken(jwt)) {
                Long userId = tokenProvider.getUserIdFromJWT(jwt);
                Optional<User> user = userRepository.findById(userId);
                if (user.isPresent() && Boolean.TRUE.equals(user.get().getActived()) && user.get().getAuthorities() != null) {
                    List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.get().getAuthorities().getName()));
                    org.springframework.security.core.userdetails.User principal =
                            new org.springframework.security.core.userdetails.User(String.valueOf(userId), "", authorities);
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(principal, jwt, authorities));
                }
            }
        } catch (Exception ex) {
            log.warn("Không xác thực được token: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
