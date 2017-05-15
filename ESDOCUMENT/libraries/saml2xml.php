<?php
class SAML_XmlToArray
{
	const PRIVATE_KEY_PREFIX    = '__';
	const TAG_NAME_KEY          = '__t';
	const VALUE_KEY             = '__v';
	const PLACEHOLDER_VALUE     = '__placeholder__';
	const ATTRIBUTE_KEY_PREFIX  = '_';
	const MAX_RECURSION_LEVEL   = 50;

	/**
	 * @var array All namespaces used in SAML2 messages.
	 */
	protected static $_namespaces = array(
        'urn:oasis:names:tc:SAML:1.0:protocol'          => 'samlp',
        'urn:oasis:names:tc:SAML:1.0:assertion'         => 'saml',
        'urn:oasis:names:tc:SAML:2.0:protocol'          => 'samlp',
        'urn:oasis:names:tc:SAML:2.0:assertion'         => 'saml',
        'urn:oasis:names:tc:SAML:2.0:metadata'          => 'md',
        'urn:oasis:names:tc:SAML:2.0:metadata:ui'       => 'mdui',
        'http://www.w3.org/2001/XMLSchema-instance'     => 'xsi',
        'http://www.w3.org/2001/XMLSchema'              => 'xs',
        'http://schemas.xmlsoap.org/soap/envelope/'     => 'SOAP-ENV',
        'http://www.w3.org/2000/09/xmldsig#'            => 'ds',
        'http://www.w3.org/2001/04/xmlenc#'             => 'xenc',
	);

	/**
	 * @var array All XML entities which are treated as single values in Corto.
	 */
	protected static $_singulars = array(
        'md:AffiliationDescriptor',
	#        'md:AttributeAuthorityDescriptor',
	#        'md:AuthnAuthorityDescriptor',
        'md:Company',
	#        'md:EntitiesDescriptor',
	#        'md:EntityDescriptor',
        'md:Extensions',
        'md:GivenName',
	#        'md:IDPSSODescriptor',
        'md:Organization',
	#        'md:PDPDescriptor',
	#        'md:RoleDescriptor',
	#        'md:SPSSODescriptor',
        'md:SurName',
        'saml:Advice',
        'saml:Assertion',             #
        'saml:AssertionIDRef',        #
        'saml:AssertionURIRef',        #
	#        'saml:Attribute',
	#        'saml:AttributeStatement',
        'saml:Audience',
        'saml:AudienceRestriction',
        'saml:AuthnContext',
        'saml:AuthnContextClassRef',
        'saml:AuthnContextDecl',
        'saml:AuthnContextDeclRef',
        'saml:AuthnStatement',        #
	#        'saml:AuthzDecisionStatement',
        'saml:BaseID',
	#        'saml:Condition',
        'saml:Conditions',
        'saml:EncryptedAssertion',    #
	#        'saml:EncryptedAttribute',
        'saml:EncryptedID',
        'saml:Evidence',
        'saml:Issuer',
        'saml:NameID',
	#        'saml:OneTimeUse',
	#        'saml:ProxyRestriction',
	#        'saml:Statement',
        'saml:Subject',
        'saml:SubjectConfirmation',
        'saml:SubjectConfirmationData',
        'saml:SubjectLocality',
        'samlp:Artifact',
        'samlp:Extensions',
        'samlp:GetComplete',
        'samlp:IDPList',
        'samlp:NameIDPolicy',
        'samlp:NewEncryptedID',
        'samlp:NewID',
        'samlp:RequestedAuthnContext',
        'samlp:Scoping',
        'samlp:Status',
        'samlp:StatusCode',
        'samlp:StatusDetail',
        'samlp:StatusMessage',
        'samlp:Terminate',
        'xenc:EncryptedData',
        'ds:CanonicalizationMethod',
        'ds:DigestMethod',
        'ds:DigestValue',
        'ds:DSAKeyValue',
        'ds:KeyInfo',
	#        'ds:KeyName',
	#        'ds:KeyValue',
	#        'ds:MgmtData',
	#        'ds:PGPData',
	#        'ds:RetrievalMethod',
        'ds:RSAKeyValue',
        'ds:Signature',
        'ds:SignatureMethod',
        'ds:SignatureValue',
        'ds:SignedInfo',
	#        'ds:SPKIData',
        'ds:Transforms',
	#        'ds:X509Data',
	);

	protected static $_multipleValues = array(
        'saml:Attribute',
        'saml:EncryptedAttribute',
        'saml:AttributeValue',
        'samlp:IDPEntry',
        'saml:AuthenticatingAuthority',
        'samlp:RequesterID',
        'ds:X509Certificate',
        'ds:Transform',
        'md:EntityDescriptor',
        'md:KeyDescriptor',
	#        'md:AssertionConsumerService',
	);

	public static function xml2array($xml)
	{
		$parser = xml_parser_create();
		xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
		$parserResultStatus = xml_parse_into_struct($parser, $xml, $values);
		if ($parserResultStatus !== 1) {
			throw new Corto_XmlToArray_Exception(
                'Error parsing incoming XML. ' . PHP_EOL .
                'Error code: '.xml_error_string(xml_get_error_code($parser)) . PHP_EOL .
                'XML: ' . $xml);
		}

		xml_parser_free($parser);
		self::$_singulars = array_fill_keys(self::$_singulars, 1);
		$return = self::_xml2array($values);
		return $return[0];
	}
	/**
	 * Convert a flat array of entities, begotten from the PHP xml_parser into a hierarchical array recursively.
	 *
	 * @static
	 * @param array $elements
	 * @param int   $level
	 * @param array $namespaceMapping
	 * @return array
	 */

	protected static $c = 0;

	protected static function _xml2array(&$elements, $level = 1, $namespaceMapping = array())
	{
		static $defaultNs;
		$newElement = array();
		while(isset($elements[self::$c]) && ($value = $elements[self::$c])) {
		  ++self::$c;
			if ($value['type'] == 'close') {
				return $newElement;
			} elseif ($value['type'] == 'cdata') {
				continue;
			}

			$hashedAttributes = array();
			$tagName = $value['tag'];
			if (isset($value['attributes']) && $attributes = $value['attributes']) {
				foreach($attributes as $attributeKey => $attributeValue) {
					unset($attributes[$attributeKey]);

					if (preg_match("/^xmlns:(.+)$/", $attributeKey, $namespacePrefixAndTag)) {
						if (!self::$_namespaces[$attributeValue]) {
							self::$_namespaces[$attributeValue] = $namespacePrefixAndTag[1];
						}
						$namespaceMapping[$namespacePrefixAndTag[1]] = self::$_namespaces[$attributeValue];
						$hashedAttributes['_xmlns:'.self::$_namespaces[$attributeValue]] = $attributeValue;
					} elseif (preg_match("/^xmlns$/", $attributeKey)) {
						$defaultNs = self::$_namespaces[$attributeValue];
					} else {
						$hashedAttributes[self::ATTRIBUTE_KEY_PREFIX . $attributeKey] = $attributeValue;
					}
				}
			}
			$complete = array();
			if (preg_match("/^(.+):(.+)$/", $tagName, $namespacePrefixAndTag) && $prefix = $namespaceMapping[$namespacePrefixAndTag[1]]) {
				$tagName = $prefix . ":" . $namespacePrefixAndTag[2];
			} else {
				$tagName = $defaultNs . ":" . $tagName;
			}
			$complete[self::TAG_NAME_KEY] = $tagName;
			if ($hashedAttributes) {
				$complete = array_merge($complete, $hashedAttributes);
			}
			if (isset($value['value']) && $attributeValue = trim($value['value'])) {
				$complete[self::VALUE_KEY] = $attributeValue;
			}
			if ($value['type'] == 'open') {
				$cs = self::_xml2array($elements, $level + 1, $namespaceMapping);
				foreach($cs as $c) {
					$tagName = $c[self::TAG_NAME_KEY];
					unset($c[self::TAG_NAME_KEY]);
					#                   if (in_array($tagName, self::$_multipleValues)) {
					#                    if (!in_array($tagName, self::$_singulars)) {
					if (!isset(self::$_singulars[$tagName]) || !self::$_singulars[$tagName]) {
						$complete[$tagName][] = $c;
					} else {
						$complete[$tagName] = $c;
						unset($complete[$tagName][self::TAG_NAME_KEY]);
					}
				}
			} elseif ($value['type'] == 'complete') {
			}
			if ($level == 2) {
				#                print_r($complete);
				#                print time() . "\n";
			}
			$newElement[] = $complete;
		}
		return $newElement;
	}

}
