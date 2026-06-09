package com.campus.campus_api.domain.grade.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class GradeUpdateRequest {

    @Pattern(regexp = "A\\+|A|B\\+|B|C\\+|C|D\\+|D|F|P|NP",
             message = "올바른 성적 기호를 입력해주세요.")
    private String letterGrade;

    @DecimalMin(value = "0.0", message = "점수는 0 이상이어야 합니다.")
    @DecimalMax(value = "100.0", message = "점수는 100 이하여야 합니다.")
    private BigDecimal score;

    @DecimalMin(value = "0.0", message = "평점은 0.0 이상이어야 합니다.")
    @DecimalMax(value = "4.5", message = "평점은 4.5 이하여야 합니다.")
    private BigDecimal gradePoints;

    private String remark;
}
