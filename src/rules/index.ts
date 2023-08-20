import { type RuleConstructor } from "../rule";
import AllowedLinks from "./allowed-links";
import AreaAlt from "./area-alt";
import AriaHiddenBody from "./aria-hidden-body";
import AriaLabelMisuse from "./aria-label-misuse";
import AttrCase from "./attr-case";
import AttrDelimiter from "./attr-delimiter";
import AttrPattern from "./attr-pattern";
import AttrQuotes from "./attr-quotes";
import AttrSpacing from "./attr-spacing";
import AttributeAllowedValues from "./attribute-allowed-values";
import AttributeBooleanStyle from "./attribute-boolean-style";
import AttributeEmptyStyle from "./attribute-empty-style";
import AttributeMisuse from "./attribute-misuse";
import ClassPattern from "./class-pattern";
import CloseAttr from "./close-attr";
import CloseOrder from "./close-order";
import Deprecated from "./deprecated";
import DeprecatedRule from "./deprecated-rule";
import DoctypeHtml from "./doctype-html";
import DoctypeStyle from "./doctype-style";
import ElementCase from "./element-case";
import ElementName from "./element-name";
import ElementPermittedContent from "./element-permitted-content";
import ElementPermittedOccurrences from "./element-permitted-occurrences";
import ElementPermittedOrder from "./element-permitted-order";
import ElementPermittedParent from "./element-permitted-parent";
import ElementRequiredAncestor from "./element-required-ancestor";
import ElementRequiredAttributes from "./element-required-attributes";
import ElementRequiredContent from "./element-required-content";
import EmptyHeading from "./empty-heading";
import EmptyTitle from "./empty-title";
import FormDupName from "./form-dup-name";
import HeadingLevel from "./heading-level";
import IdPattern from "./id-pattern";
import InputAttributes from "./input-attributes";
import InputMissingLabel from "./input-missing-label";
import LongTitle from "./long-title";
import MetaRefresh from "./meta-refresh";
import MapDupName from "./map-dup-name";
import MapIdName from "./map-id-name";
import MissingDoctype from "./missing-doctype";
import MultipleLabeledControls from "./multiple-labeled-controls";
import NoAutoplay from "./no-autoplay";
import NoConditionalComment from "./no-conditional-comment";
import NoDeprecatedAttr from "./no-deprecated-attr";
import NoDupAttr from "./no-dup-attr";
import NoDupClass from "./no-dup-class";
import NoDupId from "./no-dup-id";
import NoImplicitButtonType from "./no-implicit-button-type";
import NoImplicitClose from "./no-implicit-close";
import NoInlineStyle from "./no-inline-style";
import NoMissingReferences from "./no-missing-references";
import NoMultipleMain from "./no-multiple-main";
import NoRawCharacters from "./no-raw-characters";
import NoRedundantAriaLabel from "./no-redundant-aria-label";
import NoRedundantFor from "./no-redundant-for";
import NoRedundantRole from "./no-redundant-role";
import NoSelfClosing from "./no-self-closing";
import NoStyleTag from "./no-style-tag";
import NoTrailingWhitespace from "./no-trailing-whitespace";
import NoUnknownElements from "./no-unknown-elements";
import NoUnusedDisable from "./no-unused-disable";
import NoUtf8Bom from "./no-utf8-bom";
import PreferButton from "./prefer-button";
import PreferNativeElement from "./prefer-native-element";
import PreferTbody from "./prefer-tbody";
import RequireCSPNonce from "./require-csp-nonce";
import RequireSri from "./require-sri";
import ScriptElement from "./script-element";
import ScriptType from "./script-type";
import SvgFocusable from "./svg-focusable";
import TelNonBreaking from "./tel-non-breaking";
import TextContent from "./text-content";
import UnrecognizedCharRef from "./unrecognized-char-ref";
import ValidID from "./valid-id";
import VoidContent from "./void-content";
import VoidStyle from "./void-style";
import WCAG from "./wcag";

const bundledRules: Record<string, RuleConstructor<any, any>> = {
	"allowed-links": AllowedLinks,
	"area-alt": AreaAlt,
	"aria-hidden-body": AriaHiddenBody,
	"aria-label-misuse": AriaLabelMisuse,
	"attr-case": AttrCase,
	"attr-delimiter": AttrDelimiter,
	"attr-pattern": AttrPattern,
	"attr-quotes": AttrQuotes,
	"attr-spacing": AttrSpacing,
	"attribute-allowed-values": AttributeAllowedValues,
	"attribute-boolean-style": AttributeBooleanStyle,
	"attribute-empty-style": AttributeEmptyStyle,
	"attribute-misuse": AttributeMisuse,
	"class-pattern": ClassPattern,
	"close-attr": CloseAttr,
	"close-order": CloseOrder,
	deprecated: Deprecated,
	"deprecated-rule": DeprecatedRule,
	"doctype-html": DoctypeHtml,
	"doctype-style": DoctypeStyle,
	"element-case": ElementCase,
	"element-name": ElementName,
	"element-permitted-content": ElementPermittedContent,
	"element-permitted-occurrences": ElementPermittedOccurrences,
	"element-permitted-order": ElementPermittedOrder,
	"element-permitted-parent": ElementPermittedParent,
	"element-required-ancestor": ElementRequiredAncestor,
	"element-required-attributes": ElementRequiredAttributes,
	"element-required-content": ElementRequiredContent,
	"empty-heading": EmptyHeading,
	"empty-title": EmptyTitle,
	"form-dup-name": FormDupName,
	"heading-level": HeadingLevel,
	"id-pattern": IdPattern,
	"input-attributes": InputAttributes,
	"input-missing-label": InputMissingLabel,
	"long-title": LongTitle,
	"map-dup-name": MapDupName,
	"map-id-name": MapIdName,
	"meta-refresh": MetaRefresh,
	"missing-doctype": MissingDoctype,
	"multiple-labeled-controls": MultipleLabeledControls,
	"no-autoplay": NoAutoplay,
	"no-conditional-comment": NoConditionalComment,
	"no-deprecated-attr": NoDeprecatedAttr,
	"no-dup-attr": NoDupAttr,
	"no-dup-class": NoDupClass,
	"no-dup-id": NoDupId,
	"no-implicit-button-type": NoImplicitButtonType,
	"no-implicit-close": NoImplicitClose,
	"no-inline-style": NoInlineStyle,
	"no-missing-references": NoMissingReferences,
	"no-multiple-main": NoMultipleMain,
	"no-raw-characters": NoRawCharacters,
	"no-redundant-aria-label": NoRedundantAriaLabel,
	"no-redundant-for": NoRedundantFor,
	"no-redundant-role": NoRedundantRole,
	"no-self-closing": NoSelfClosing,
	"no-style-tag": NoStyleTag,
	"no-trailing-whitespace": NoTrailingWhitespace,
	"no-unknown-elements": NoUnknownElements,
	"no-unused-disable": NoUnusedDisable,
	"no-utf8-bom": NoUtf8Bom,
	"prefer-button": PreferButton,
	"prefer-native-element": PreferNativeElement,
	"prefer-tbody": PreferTbody,
	"require-csp-nonce": RequireCSPNonce,
	"require-sri": RequireSri,
	"script-element": ScriptElement,
	"script-type": ScriptType,
	"svg-focusable": SvgFocusable,
	"tel-non-breaking": TelNonBreaking,
	"text-content": TextContent,
	"unrecognized-char-ref": UnrecognizedCharRef,
	"valid-id": ValidID,
	"void-content": VoidContent,
	"void-style": VoidStyle,
	...WCAG,
};

export default bundledRules;
