package com.project.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventTargetDto {
    private String batch; // N22, N23... (Null là tất cả)
    private String major; // CN, AT... (Null là tất cả)
}
