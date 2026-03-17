package com.petproject.petproject.dto;

public class VetSlotRequest {
    private String date;       // "2025-12-26"
    private String startTime;  // "10:00"
    private String endTime;    // "11:00"
    private String mode;       // "In-Clinic" or "Online"
    private Integer capacity;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
