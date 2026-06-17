from priority_detector import detect_priority

text = "Oil is leaking near machine number 4."

priority = detect_priority(text)

print("Suggestion:", text)
print("Priority:", priority)