package com.project.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddEventManagerRequest {
    private String identifier; // Email hoặc Mã sinh viên của người cần gán quyền
}
