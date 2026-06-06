package helpers

import (
	"net/url"
	"strconv"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type FieldType int

const (
	FieldTypeString FieldType = iota
	FieldTypeNumeric
	FieldTypeBool
	FieldTypeObjectID
)

type FilterConfig struct {
	AllowedFields map[string]struct{}
	FieldTypes    map[string]FieldType
	RegexFields   map[string]struct{}
}

func BuildFilter(values url.Values, cfg FilterConfig) bson.M {
	filter := bson.M{}

	for key, valuesList := range values {
		if len(valuesList) == 0 {
			continue
		}

		rawValue := valuesList[len(valuesList)-1]
		field, op := parseFilterKey(key)
		if field == "" {
			continue
		}

		if len(cfg.AllowedFields) > 0 {
			if _, ok := cfg.AllowedFields[field]; !ok {
				continue
			}
		}

		fieldType := cfg.FieldTypes[field]

		switch op {
		case "in", "nin":
			items := parseList(rawValue, fieldType)
			filter[field] = bson.M{"$" + op: items}
		case "exists":
			filter[field] = bson.M{"$exists": parseBool(rawValue)}
		case "eq":
			if fieldType == FieldTypeNumeric {
				if num, ok := parseNumeric(rawValue); ok {
					filter[field] = num
				}
			} else if fieldType == FieldTypeBool {
				filter[field] = parseBool(rawValue)
			} else if fieldType == FieldTypeObjectID {
				if oid, err := bson.ObjectIDFromHex(rawValue); err == nil {
					filter[field] = oid
				}
			} else if isRegexField(field, cfg) {
				filter[field] = bson.M{"$regex": rawValue, "$options": "i"}
			} else {
				filter[field] = rawValue
			}
		default:
			if fieldType == FieldTypeNumeric {
				if num, ok := parseNumeric(rawValue); ok {
					filter[field] = bson.M{"$" + op: num}
				}
			} else if fieldType == FieldTypeBool {
				filter[field] = bson.M{"$" + op: parseBool(rawValue)}
			} else if fieldType == FieldTypeObjectID {
				if oid, err := bson.ObjectIDFromHex(rawValue); err == nil {
					filter[field] = bson.M{"$" + op: oid}
				}
			} else {
				filter[field] = bson.M{"$" + op: rawValue}
			}
		}
	}

	return filter
}

func parseFilterKey(key string) (field, op string) {
	parts := strings.SplitN(key, "__", 2)
	field = strings.TrimSpace(parts[0])
	op = "eq"
	if len(parts) == 2 && parts[1] != "" {
		op = strings.TrimSpace(parts[1])
	}
	return
}

func parseNumeric(raw string) (float64, bool) {
	num, err := strconv.ParseFloat(raw, 64)
	return num, err == nil
}

func parseBool(raw string) bool {
	raw = strings.TrimSpace(strings.ToLower(raw))
	return raw == "true" || raw == "1" || raw == "yes"
}

func parseList(raw string, fieldType FieldType) []interface{} {
	parts := strings.Split(raw, ",")
	items := make([]interface{}, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if fieldType == FieldTypeNumeric {
			if num, ok := parseNumeric(part); ok {
				items = append(items, num)
			}
		} else if fieldType == FieldTypeBool {
			items = append(items, parseBool(part))
		} else if fieldType == FieldTypeObjectID {
			if oid, err := bson.ObjectIDFromHex(part); err == nil {
				items = append(items, oid)
			}
		} else {
			items = append(items, part)
		}
	}
	return items
}

func isRegexField(field string, cfg FilterConfig) bool {
	if cfg.RegexFields == nil {
		return false
	}
	_, ok := cfg.RegexFields[field]
	return ok
}
